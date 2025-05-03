import express, { Router, Request, Response, NextFunction } from "express";
import type { ActionItem } from "../../shared/types/actionItem";
import { v4 as uuidv4 } from "uuid";
import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";

// Explicitly load environment variables
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env') 
});

const router: Router = express.Router();

// Enhanced API key validation with detailed logging
function validateOpenAIKey(key: string): { valid: boolean; reason?: string; details?: any } {
  if (!key) return { valid: false, reason: 'API key is empty' };
  key = key.trim();
  if (key.length < 40) {
    return { valid: false, reason: `Key too short: ${key.length} characters`, details: { currentLength: key.length, expectedMinLength: 40 } };
  }
  const validPrefixes = ['sk-proj-', 'sk-'];
  const hasValidPrefix = validPrefixes.some(prefix => key.startsWith(prefix));
  if (!hasValidPrefix) {
    return { valid: false, reason: `Invalid key prefix. Expected one of: ${validPrefixes.join(', ')}`, details: { currentPrefix: key.slice(0, 10), validPrefixes } };
  }
  const keyRegex = /^sk-[a-zA-Z0-9_.-]+$/;
  if (!keyRegex.test(key)) {
    return { valid: false, reason: 'Key contains invalid characters', details: { invalidCharactersFound: key.replace(/^sk-[a-zA-Z0-9_.-]+$/, '') } };
  }
  return { valid: true };
}

const rawApiKey = process.env.OPENAI_API_KEY || '';
const keyValidation = validateOpenAIKey(rawApiKey);
let openai: OpenAI | null = null;
try {
  if (rawApiKey && keyValidation.valid) {
    openai = new OpenAI({ apiKey: rawApiKey.trim() });
  }
} catch (error) {
  // No logging
}


// Explicitly type the route handler
const extractActionItems = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { notesOrSummary } = req.body as { notesOrSummary: string };
  if (!notesOrSummary) {
    return res.status(400).json({ error: "Missing notes or summary" });
  }

  try {
    if (!openai) {
      return res.status(500).json({ 
        error: 'OpenAI API configuration error',
        details: 'API key is missing, invalid, or not properly configured',
        validation: keyValidation,
        troubleshooting: [
          'Check your .env file',
          'Verify the OPENAI_API_KEY is correct',
          'Ensure the key follows a valid OpenAI key format'
        ]
      });
    }

    const systemPrompt = `\nYou are an expert meeting assistant.\nExtract all actionable items from the following meeting notes or summary.\nFor each action item, include: description, owner (if mentioned), due date (if mentioned), and status (default to 'open').\nRespond ONLY with a valid JSON object in the following format, and nothing else—no prose, no markdown, no comments:\n\n{\n  "items": [\n    {\n      "id": "string (uuid, can be blank)",\n      "description": "string",\n      "owner": "string (optional)",\n      "dueDate": "string (optional)",\n      "status": "open",\n      "sourceText": "string"\n    }\n    // ... more items\n  ]\n}\n`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: notesOrSummary }
      ],
      max_tokens: 512,
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    let items: ActionItem[] = [];
    try {
      const content = completion.choices?.[0]?.message?.content || '{}';
      console.log('Raw OpenAI content:', content); 
      // Attempted fix: Robustly handle partial/malformed JSON from LLM
      // Defensive extraction: get the first valid JSON object from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : '{}';

      let parsed: any = {};
      let parsedItems: any[] = [];
      try {
        parsed = JSON.parse(jsonString);
        parsedItems = parsed.items || [];
      } catch (jsonErr) {
        // Attempted fix: Recover partial items from a truncated array if JSON.parse fails
        const arrayMatch = jsonString.match(/"items"\s*:\s*\[([\s\S]*)$/);
        if (arrayMatch) {
          const itemsString = arrayMatch[1];
          // Try to split items by '},' (end of an object), and parse each object individually
          parsedItems = itemsString
            .split('},')
            .map((item, idx, arr) => {
              // Add back the closing } (except for the last item, which may be incomplete)
              if (idx < arr.length - 1) item += '}';
              try {
                // Attempt to parse each object
                return JSON.parse('{' + item.split('{').slice(1).join('{'));
              } catch {
                return null;
              }
            })
            .filter(Boolean);
        }
      }
      items = parsedItems.map((item: any) => ({
        ...item,
        id: item?.id || uuidv4(),
        status: item?.status || 'open',
        sourceText: notesOrSummary
      }));
      console.log('Extracted Action Items:', items); // Debug log
      // If items were recovered from partial JSON, add a warning
      return res.status(200).json({ items, warning: parsedItems.length === 0 ? 'Partial or truncated response from AI' : undefined });
    } catch (err) {
      // If all else fails, return a parse error
      console.error('Failed to parse AI response:', err);
      return res.status(500).json({ 
        error: 'Failed to parse AI response', 
        details: err instanceof Error ? err.message : String(err) 
      });
    }
  } catch (error) {
    console.error("Error extracting action items:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  extractActionItems(req, res, next).catch(next);
});

export default router;
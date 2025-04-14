import express, { Router, Request, Response, NextFunction } from "express";
import type { ActionItem } from "../../shared/types/actionItem";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";

// Create a typed router
const router: Router = express.Router();

// Explicitly type the route handler
const extractActionItems = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const { notesOrSummary } = req.body as { notesOrSummary: string };
  if (!notesOrSummary) {
    return res.status(400).json({ error: "Missing notes or summary" });
  }

  try {
    const systemPrompt = `You are a meeting assistant. Extract all actionable items from the following meeting notes or summary. For each action item, include a description, owner (if mentioned), due date (if mentioned), and status (default to 'open'). Respond ONLY with a JSON array of ActionItem objects with fields: id (generate a uuid), description, owner, dueDate, status, sourceText.`;
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return res.status(500).json({ error: "Missing OpenAI API key" });
    }
    
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: notesOrSummary }
    ];
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 512,
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: 'OpenAI API error', details: errText });
    }

    const data = await response.json();
    let items: ActionItem[] = [];
    
    try {
      const content = data.choices?.[0]?.message?.content || '[]';
      const parsedItems = JSON.parse(content).items || [];
      
      items = parsedItems.map((item: any) => ({
        ...item,
        id: item.id || uuidv4(),
        status: item.status || 'open',
        sourceText: notesOrSummary
      }));
      
      return res.status(200).json(items);
    } catch (err) {
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
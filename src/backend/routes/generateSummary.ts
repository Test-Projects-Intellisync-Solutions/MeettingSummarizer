import express from 'express';
import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load environment variables
dotenv.config({ 
  path: path.resolve(process.cwd(), '.env') 
});

const router = express.Router();

// Enhanced API key validation with detailed logging
function validateOpenAIKey(key: string): { valid: boolean; reason?: string; details?: any } {
  // Check for basic presence
  if (!key) {
    return { valid: false, reason: 'API key is empty' };
  }

  // Trim any potential whitespace
  key = key.trim();

  // More flexible length check
  if (key.length < 40) {
    return { 
      valid: false, 
      reason: `Key too short: ${key.length} characters`, 
      details: { 
        currentLength: key.length, 
        expectedMinLength: 40 
      }
    };
  }

  // Check prefix (support multiple OpenAI key formats)
  const validPrefixes = ['sk-proj-', 'sk-'];
  const hasValidPrefix = validPrefixes.some(prefix => key.startsWith(prefix));
  
  if (!hasValidPrefix) {
    return { 
      valid: false, 
      reason: `Invalid key prefix. Expected one of: ${validPrefixes.join(', ')}`,
      details: {
        currentPrefix: key.slice(0, 10),
        validPrefixes: validPrefixes
      }
    };
  }

  // More relaxed character validation
  const keyRegex = /^sk-[a-zA-Z0-9_.-]+$/;
  if (!keyRegex.test(key)) {
    console.error('API Key Validation Failed', { 
      key: key.slice(0, 10) + '...', 
      regex: keyRegex.toString() 
    });
    return { 
      valid: false, 
      reason: 'Key contains invalid characters',
      details: {
        invalidCharactersFound: key.replace(/^sk-[a-zA-Z0-9_.-]+$/, '')
      }
    };
  }

  return { valid: true };
}

// Log API key validation
const rawApiKey = process.env.OPENAI_API_KEY || '';
const keyValidation = validateOpenAIKey(rawApiKey);

// Safely create OpenAI instance
let openai: OpenAI | null = null;
try {
  if (!rawApiKey) {
    // No logging
  } else if (!keyValidation.valid) {
    // No logging
  } else {
    openai = new OpenAI({
      apiKey: rawApiKey.trim()
    });
  }
} catch (error) {
  // No logging
}

// Define the route handler function separately
const handleGenerateSummary = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Validate API key
    if (!openai) {
      res.status(500).json({ 
        error: 'OpenAI API configuration error',
        details: 'API key is missing, invalid, or not properly configured',
        validation: keyValidation,
        troubleshooting: [
          'Check your .env file',
          'Verify the OPENAI_API_KEY is correct',
          'Ensure the key follows a valid OpenAI key format'
        ]
      });
      return;
    }

    // Extract notes from body or files with multiple fallback options
    const notes = 
      req.body.notes || 
      req.body.note || 
      (typeof req.body === 'string' ? req.body : '') || 
      '';

    // Process uploaded documents if any
    const documents = (req.files as Express.Multer.File[] || []).map(doc => ({
      id: uuidv4(),
      name: doc.originalname || doc.filename || 'Unnamed Document',
      content: doc.buffer ? doc.buffer.toString('utf-8') : ''
    }));

    // Validate input
    if (!notes) {
      res.status(400).json({ error: 'Meeting notes are required' });
      return;
    }

    // Set headers for Server-Sent Events (SSE)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-open');

    const stream = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `You are an expert meeting summarizer. Generate a comprehensive, professional summary that:
          1. Captures the key discussion points and insights
          2. Highlights important action items and responsibilities
          3. Provides a clear, structured overview of the meeting
          4. Use markdown formatting for readability
          5. Include section headers to organize the summary
          6. Be concise but thorough, aiming for 700-1050 words`
        },
        {
          role: "user",
          content: `Meeting Notes:\n${notes}\n\nAdditional Documents:\n${
            documents.length > 0 
              ? documents.map(doc => `Document ${doc.name}:\n${doc.content}`).join('\n\n')
              : 'No additional documents'
          }`
        }
      ],
      max_tokens: 4000,
      temperature: 0.5,
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: {"type": "done"}\n\n');
    res.end();
  } catch (error) {
    // More detailed error handling
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Failed to generate summary', 
        message: error.message,
        troubleshooting: [
          'Verify OpenAI API key is valid',
          'Check network connection',
          'Ensure API key has sufficient permissions'
        ]
      });
    } else {
      res.status(500).json({ 
        error: 'An unknown error occurred during summary generation' 
      });
    }
  }
};

// Apply the route handler
router.post('/', handleGenerateSummary);

export default router;

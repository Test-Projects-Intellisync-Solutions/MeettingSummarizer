import express, { Request, Response } from 'express';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload-document
// Accepts a PDF file upload, extracts text, and returns it
router.post('/', upload.single('document'), async (req: Request, res: Response): Promise<void> => {
  try {
    // Dynamically import pdf-parse to avoid ESM/TSX test bug
    const pdfParse = (await import('pdf-parse')).default;

    if (!req.file) {
      res.status(400).json({ error: 'No document uploaded' });
      return;
    }
    if (req.file.mimetype !== 'application/pdf') {
      res.status(400).json({ error: 'Only PDF files are supported at this time' });
      return;
    }
    const data = await pdfParse(req.file.buffer);
    const text = data.text;
    res.status(200).json({ message: 'Document uploaded and parsed successfully', text });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process document', details: error instanceof Error ? error.message : String(error) });
  }
});

// TODO: Support more file types (Word, images with OCR, etc.) and advanced extraction logic

export default router;

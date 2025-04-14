import express, { Request, Response } from 'express';
const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { rating, comment } = req.body;
    // TODO: Implement feedback storage logic (e.g., with Supabase)
    res.status(200).json({ message: 'Feedback received successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

export default router;

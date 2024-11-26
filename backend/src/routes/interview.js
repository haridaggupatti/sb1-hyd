import express from 'express';
import { auth } from '../middleware/auth.js';
import { openaiLimiterMiddleware } from '../middleware/rateLimiter.js';
import { openaiService } from '../services/openai.js';

const router = express.Router();

router.post('/resume', auth, openaiLimiterMiddleware, async (req, res) => {
  try {
    const { resumeText } = req.body;
    const result = await openaiService.processResume(resumeText, req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/chat', auth, openaiLimiterMiddleware, async (req, res) => {
  try {
    const { question, sessionId } = req.body;
    const result = await openaiService.generateResponse(
      question,
      sessionId,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
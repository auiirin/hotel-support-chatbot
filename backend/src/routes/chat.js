import { Router } from 'express';
import { searchRelevantChunks } from '../services/search.js';
import { getChatResponse, streamChatResponse } from '../services/claude.js';
import { logConversation } from '../services/conversationLogger.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'message is required' });
    }

    const contextChunks = await searchRelevantChunks(message.trim());
    const answer = await getChatResponse(message.trim(), contextChunks, history);
    const sources = contextChunks.map((c) => c.source).filter(Boolean);

    logConversation({ message: message.trim(), answer, sources });
    res.json({ answer, sources });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/stream', async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ error: 'message is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const contextChunks = await searchRelevantChunks(message.trim());
    let fullAnswer = '';

    await streamChatResponse(message.trim(), contextChunks, history, (text) => {
      fullAnswer += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    const sources = contextChunks.map((c) => c.source).filter(Boolean);
    logConversation({ message: message.trim(), answer: fullAnswer, sources });
    res.write(`data: ${JSON.stringify({ done: true, sources })}\n\n`);
  } catch (err) {
    console.error('Stream error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Internal server error' })}\n\n`);
  } finally {
    res.end();
  }
});

export default router;

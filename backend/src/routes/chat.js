import { Router } from 'express';
import { searchRelevantChunks } from '../services/search.js';
import { getChatResponse, streamChatResponse } from '../services/claude.js';
import { logConversation } from '../services/conversationLogger.js';
import { sendEscalationEmail } from '../services/mailer.js';

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
  const { message = '', history = [], image = null } = req.body;
  if (!message.trim() && !image) {
    return res.status(400).json({ error: 'message or image is required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const contextChunks = await searchRelevantChunks(message.trim() || 'error screenshot');
    let fullAnswer = '';

    await streamChatResponse(message.trim(), contextChunks, history, (text) => {
      fullAnswer += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }, image);

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

router.post('/escalate', async (req, res) => {
  try {
    const { hotelName, reporterName, contact, problem, errorDetail, stepsTried } = req.body;
    if (!hotelName || !reporterName || !contact) {
      return res.status(400).json({ error: 'hotelName, reporterName, contact are required' });
    }
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('Gmail credentials not configured');
      return res.status(500).json({ error: 'Email service not configured' });
    }
    await sendEscalationEmail({ hotelName, reporterName, contact, problem, errorDetail, stepsTried });
    logConversation({ type: 'escalated', hotelName, reporterName, contact, problem });
    res.json({ ok: true });
  } catch (err) {
    console.error('Escalate error:', err.message);
    res.status(500).json({ error: 'Failed to send escalation email' });
  }
});

router.post('/resolve', async (req, res) => {
  try {
    const { problem, solution, history = [] } = req.body;
    if (!problem) return res.status(400).json({ error: 'problem is required' });

    logConversation({
      type: 'resolved',
      problem,
      solution,
      historyLength: history.length,
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Resolve log error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

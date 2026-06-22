import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

const client = new Anthropic({ apiKey: config.anthropicApiKey });

const SYSTEM_PROMPT = `คุณคือ Support Agent ของระบบจัดการโรงแรม (Hotel Management Software)
หน้าที่ของคุณคือช่วยตอบคำถามและแก้ปัญหาให้กับลูกค้าที่ใช้งานซอฟต์แวร์

กฎการตอบ:
- ตอบเป็นภาษาเดียวกับที่ผู้ใช้ถาม (ไทย หรือ อังกฤษ)
- ตอบโดยอิงจาก Context ที่ให้มาเท่านั้น
- ถ้าไม่มีข้อมูลใน context ให้บอกตามตรงว่าไม่ทราบ และแนะนำให้ติดต่อทีม support โดยตรง
- ห้ามแต่งข้อมูลหรือเดาคำตอบ
- ตอบให้กระชับ ชัดเจน และเป็นมิตร`;

function buildMessages(userMessage, contextChunks, conversationHistory) {
  const contextText =
    contextChunks.length > 0
      ? contextChunks.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n')
      : 'ไม่พบข้อมูลที่เกี่ยวข้องใน knowledge base';

  return [
    ...conversationHistory,
    { role: 'user', content: `Context จาก knowledge base:\n${contextText}\n\nคำถาม: ${userMessage}` },
  ];
}

export async function getChatResponse(userMessage, contextChunks, conversationHistory) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: buildMessages(userMessage, contextChunks, conversationHistory),
  });
  return response.content[0].text;
}

export async function streamChatResponse(userMessage, contextChunks, conversationHistory, onText) {
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: buildMessages(userMessage, contextChunks, conversationHistory),
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      onText(event.delta.text);
    }
  }

  await stream.finalMessage();
}

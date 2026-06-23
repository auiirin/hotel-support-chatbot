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

function buildMessages(userMessage, contextChunks, conversationHistory, image = null) {
  const contextText =
    contextChunks.length > 0
      ? contextChunks.map((c, i) => `[${i + 1}] ${c.content}`).join('\n\n')
      : 'ไม่พบข้อมูลที่เกี่ยวข้องใน knowledge base';

  const textContent = {
    type: 'text',
    text: `Context จาก knowledge base:\n${contextText}\n\nคำถาม: ${userMessage || '(ดูรูปภาพ error ที่แนบมา)'}`,
  };

  const userContent = image
    ? [
        { type: 'image', source: { type: 'base64', media_type: image.mimeType, data: image.base64 } },
        textContent,
      ]
    : textContent.text;

  return [
    ...conversationHistory,
    { role: 'user', content: userContent },
  ];
}

export async function getChatResponse(userMessage, contextChunks, conversationHistory, image = null) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: buildMessages(userMessage, contextChunks, conversationHistory, image),
  });
  return response.content[0].text;
}

export async function streamChatResponse(userMessage, contextChunks, conversationHistory, onText, image = null) {
  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: buildMessages(userMessage, contextChunks, conversationHistory, image),
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      onText(event.delta.text);
    }
  }

  await stream.finalMessage();
}

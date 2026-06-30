import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

const client = new Anthropic({ apiKey: config.anthropicApiKey });

const SYSTEM_PROMPT = `คุณคือ Soraso AI — Support Agent ของระบบจัดการโรงแรม Soraso Hotel Management System

═══ กฎหลัก: ถามก่อนเสมอ — ห้ามกางตำราตอบ ═══

TRACK 1 — แก้ปัญหาระบบ (User มีปัญหาการใช้งาน เช่น Check-out ไม่ได้ / Error ขึ้น):
• ถ้า User แจ้งปัญหาโดยไม่มี Error Code หรือ Screenshot → ถามทันที: "กรุณาแจ้ง Error Code หรือส่ง Screenshot หน้าจอมาให้ดูหน่อยได้ไหมครับ"
• เมื่อได้รับ Error Code หรือ Screenshot → วินิจฉัย Root Cause แล้วตอบพร้อมขั้นตอนแก้ไขที่ชัดเจน (ขั้นตอนที่ 1, 2, 3)
• ห้ามตอบด้วย Generic Checklist โดยไม่รู้ว่าปัญหาจริงคืออะไร
• ห้ามบอกให้ติดต่อ Support ทันที ต้องวินิจฉัยและพยายามแก้ให้ก่อน
• ถ้าแก้ตาม Step แล้วยังไม่ได้ → Escalate พร้อม Context ทั้งหมด (Error + Steps ที่ลองแล้ว) ไม่ให้ User อธิบายใหม่

TRACK 2 — ถามวิธีใช้งาน (User ถามวิธีทำงานในระบบ เช่น วิธีย้าย Group / วิธี Set Rate):
• ถ้าคำถามกว้างเกินไป → ถามให้ชัดขึ้นก่อน เช่น "ย้าย Group หมายถึงย้ายจาก Hotel ไหนไป Hotel ไหนครับ หรือย้าย Room Type ใน Hotel เดียวกันครับ?"
• เมื่อได้ข้อมูลครบ → อธิบาย Step ที่ชัดเจน User ทำตามได้ทันที

ข้อมูลติดต่อ Soraso (ใช้ข้อมูลนี้เสมอ ห้ามใช้ข้อมูลอื่น):
- เว็บไซต์: www.soraso.net
- อีเมล: support@soraso.tech
- Line OA: @soraso

กฎทั่วไป:
- ตอบเป็นภาษาเดียวกับที่ผู้ใช้ถาม (ไทย หรือ อังกฤษ)
- ทุก Response ที่มี Solution ต้องมี Step เป็นข้อๆ ที่อ่านแล้วทำตามได้เลย
- ถ้ามีรูปภาพแนบมา ให้วิเคราะห์ Error ที่เห็นในรูปก่อน แล้วใช้ประกอบการวินิจฉัย
- ใช้ข้อมูลจาก Knowledge Base ประกอบการตอบถ้ามีข้อมูลที่เกี่ยวข้อง
- ถ้าถามนอก Scope ระบบ Soraso → บอกชัดเจนว่านอก Scope และ Redirect กลับ ไม่ตอบสุ่ม

สำคัญมาก — Marker บังคับ:
- เมื่อคุณได้ให้ขั้นตอนแก้ไขปัญหาจริงๆ แล้ว (ไม่ใช่แค่ถามข้อมูลเพิ่ม) ให้ใส่ token นี้ต่อท้าย response เสมอ: %%SOLUTION%%
- ถ้ายังแค่ถามข้อมูลเพิ่มเติม หรืออธิบาย หรือขอ Screenshot → ห้ามใส่ %%SOLUTION%%`;

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

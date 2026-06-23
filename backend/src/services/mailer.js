import nodemailer from 'nodemailer';
import { config } from '../config.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.gmailUser,
    pass: config.gmailAppPassword,
  },
});

export async function sendEscalationEmail({ hotelName, reporterName, contact, problem, errorDetail, stepsTried }) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #2f80ed, #7b2ff7); padding: 20px 24px; border-radius: 10px 10px 0 0;">
        <h2 style="color: #fff; margin: 0;">🚨 Escalation Case — Soraso AI</h2>
      </div>
      <div style="border: 1px solid #e3e3e9; border-top: none; border-radius: 0 0 10px 10px; padding: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #777; width: 160px;">โรงแรม</td><td style="padding: 8px 0; font-weight: 600;">${hotelName}</td></tr>
          <tr><td style="padding: 8px 0; color: #777;">ผู้แจ้ง</td><td style="padding: 8px 0; font-weight: 600;">${reporterName}</td></tr>
          <tr><td style="padding: 8px 0; color: #777;">ติดต่อกลับ</td><td style="padding: 8px 0; font-weight: 600;">${contact}</td></tr>
        </table>
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 16px 0;" />
        <p style="color: #777; margin: 0 0 6px;">ปัญหาที่แจ้ง</p>
        <p style="background: #fafafa; border-left: 3px solid #7b2ff7; padding: 10px 14px; margin: 0 0 16px; border-radius: 4px;">${problem}</p>
        ${errorDetail ? `<p style="color: #777; margin: 0 0 6px;">Error / Screenshot</p><p style="background: #fafafa; border-left: 3px solid #d6122a; padding: 10px 14px; margin: 0 0 16px; border-radius: 4px;">${errorDetail}</p>` : ''}
        ${stepsTried ? `<p style="color: #777; margin: 0 0 6px;">Steps ที่ลองแล้ว</p><p style="background: #fafafa; border-left: 3px solid #22a06b; padding: 10px 14px; margin: 0; border-radius: 4px;">${stepsTried}</p>` : ''}
      </div>
      <p style="color: #aaa; font-size: 12px; text-align: center; margin-top: 16px;">Soraso AI — Auto Escalation System</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Soraso AI" <${config.gmailUser}>`,
    to: config.gmailUser,
    subject: `[Escalation] ${hotelName} — ${problem.slice(0, 60)}`,
    html,
  });
}

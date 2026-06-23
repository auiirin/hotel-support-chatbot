import { useState } from 'react';

export default function EscalationForm({ onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({ hotelName: '', reporterName: '', contact: '' });

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.hotelName.trim() || !form.reporterName.trim() || !form.contact.trim()) return;
    onSubmit(form);
  }

  return (
    <div className="escalation-form-overlay">
      <div className="escalation-form-card">
        <div className="escalation-form-header">
          <span className="escalation-form-icon">🚨</span>
          <div>
            <div className="escalation-form-title">ส่งเรื่องให้ทีม Support</div>
            <div className="escalation-form-sub">กรอกข้อมูลเพื่อให้ทีมติดต่อกลับได้ครับ</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="escalation-form-body">
          <label className="esc-label">
            ชื่อโรงแรม <span className="esc-required">*</span>
            <input
              className="esc-input"
              name="hotelName"
              value={form.hotelName}
              onChange={handleChange}
              placeholder="เช่น โรงแรมแกรนด์พาเลซ"
              required
            />
          </label>
          <label className="esc-label">
            ชื่อผู้แจ้ง <span className="esc-required">*</span>
            <input
              className="esc-input"
              name="reporterName"
              value={form.reporterName}
              onChange={handleChange}
              placeholder="ชื่อ-นามสกุล"
              required
            />
          </label>
          <label className="esc-label">
            เบอร์โทร / Line ID <span className="esc-required">*</span>
            <input
              className="esc-input"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="0812345678 หรือ Line ID"
              required
            />
          </label>

          <div className="esc-actions">
            <button type="button" className="esc-cancel-btn" onClick={onCancel} disabled={isLoading}>
              ยกเลิก
            </button>
            <button
              type="submit"
              className="esc-submit-btn"
              disabled={isLoading || !form.hotelName.trim() || !form.reporterName.trim() || !form.contact.trim()}
            >
              {isLoading ? 'กำลังส่ง…' : 'ส่งเรื่องให้ Support'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

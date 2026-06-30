import { useState, useRef } from 'react';

export default function LaunchView({ onSend, onSendImage, disabled, image, onAttach, onRemoveImage, fileInputRef }) {
  const suggestions = [
    'How do I fix a Gen Key Card error?',
    'Walk me through the Close Day checklist',
    'การแก้ปัญหา Close Shift',
  ];

  return (
    <>
      <div className="launch-body">
        <div className="launch-greeting-1">สวัสดีครับ!</div>
        <div className="launch-greeting-2">มีอะไรให้ช่วยไหมครับ?</div>

        <div className="quick-actions">
          <button className="quick-action-btn" onClick={() => onSend('คู่มือการใช้งาน')}>
            <span className="quick-action-icon" style={{ background: '#f3f0f9' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6a3bd0" strokeWidth="1.8">
                <path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2H4z"/>
                <path d="M20 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2H20z"/>
              </svg>
            </span>
            <span className="quick-action-label">Manual</span>
          </button>
          <button className="quick-action-btn" onClick={() => onSend('VDO Training')}>
            <span className="quick-action-icon" style={{ background: '#eef4fb' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#2f80ed"><path d="M7 5v14l11-7z"/></svg>
            </span>
            <span className="quick-action-label">VDO Training</span>
          </button>
          <button className="quick-action-btn" onClick={() => onSend('Troubleshooting')}>
            <span className="quick-action-icon" style={{ background: '#f3f0f9' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6a3bd0" strokeWidth="1.8">
                <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2-2z"/>
              </svg>
            </span>
            <span className="quick-action-label">Troubleshooting</span>
          </button>
          <button className="quick-action-btn" onClick={() => onSend('ติดต่อทีม Support')}>
            <span className="quick-action-icon" style={{ background: '#fbeced' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d6122a" strokeWidth="1.8">
                <path d="M4 13a8 8 0 0 1 16 0M4 13v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 0zM20 13v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 0z"/>
              </svg>
            </span>
            <span className="quick-action-label">Live Support</span>
          </button>
        </div>

        <div className="suggestions">
          {suggestions.map((s) => (
            <button key={s} className="suggestion-chip" onClick={() => onSend(s)} disabled={disabled}>
              {s}
            </button>
          ))}
          <button className="suggestion-chip-more" disabled={disabled}>
            More suggestions
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m9 6 6 6-6 6"/>
            </svg>
          </button>
        </div>
      </div>

      <InputFooter
        onSend={onSend}
        onSendImage={onSendImage}
        disabled={disabled}
        image={image}
        onAttach={onAttach}
        onRemoveImage={onRemoveImage}
        fileInputRef={fileInputRef}
        compact={false}
      />
    </>
  );
}

function InputFooter({ onSend, onSendImage, disabled, image, onAttach, onRemoveImage, fileInputRef }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  function handleSubmit() {
    if (!text.trim() && !image) return;
    if (image) onSendImage(text.trim(), image);
    else onSend(text.trim());
    setText('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  return (
    <div className="input-bar-wrap">
      {image && (
        <div className="image-preview-wrap">
          <img src={image.previewUrl} alt="แนบรูป" className="image-preview" />
          <button type="button" className="image-remove-btn" onClick={onRemoveImage}>✕</button>
        </div>
      )}
      <div className="input-container" onClick={() => textareaRef.current?.focus()}>
        <textarea
          ref={textareaRef}
          className="launch-textarea"
          placeholder="Ask something…"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          style={{ pointerEvents: 'auto', userSelect: 'text' }}
        />
        <div className="input-row">
          <button className="attach-btn" type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onAttach} />
          <div className="input-controls">
            <button className="model-chip">
              <span style={{ fontWeight: 600 }}>Sonnet 4.6</span>
              <span style={{ color: '#999' }}>Low</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            <button className="send-btn" type="button" disabled={disabled || (!text.trim() && !image)} onClick={handleSubmit}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="input-disclaimer">AI can make mistakes. Verify important actions before applying.</div>
    </div>
  );
}

import { useState, useRef } from 'react';

export default function InputBar({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setImage({ base64: dataUrl.split(',')[1], mimeType: file.type, previewUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function handleSubmit(e) {
    e?.preventDefault();
    if ((!text.trim() && !image) || disabled) return;
    onSend(text.trim(), image);
    setText('');
    setImage(null);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="input-bar-wrap">
      {image && (
        <div className="image-preview-wrap">
          <img src={image.previewUrl} alt="แนบรูป" className="image-preview" />
          <button type="button" className="image-remove-btn" onClick={() => setImage(null)}>✕</button>
        </div>
      )}
      <div className="input-container-compact">
        <textarea
          className="input-compact-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a follow-up…"
          disabled={disabled}
          rows={1}
        />
        <button className="attach-btn" type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
        <button className="model-chip" type="button">
          <span style={{ fontWeight: 600 }}>Sonnet 4.6</span>
          <span style={{ color: '#999' }}>Low</span>
        </button>
        <button className="send-btn-sm" type="button" onClick={handleSubmit} disabled={disabled || (!text.trim() && !image)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
            <path d="M12 19V5M5 12l7-7 7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

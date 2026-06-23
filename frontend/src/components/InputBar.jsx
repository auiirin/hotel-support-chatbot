import { useState, useRef } from 'react';

export default function InputBar({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null); // { base64, mimeType, previewUrl }
  const fileInputRef = useRef(null);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      const base64 = dataUrl.split(',')[1];
      const mimeType = file.type;
      setImage({ base64, mimeType, previewUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function removeImage() {
    setImage(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if ((!text.trim() && !image) || disabled) return;
    onSend(text.trim(), image);
    setText('');
    setImage(null);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  }

  return (
    <div className="input-bar-wrap">
      {image && (
        <div className="image-preview-wrap">
          <img src={image.previewUrl} alt="แนบรูป" className="image-preview" />
          <button type="button" className="image-remove-btn" onClick={removeImage}>✕</button>
        </div>
      )}
      <form className="input-bar" onSubmit={handleSubmit}>
        <button
          type="button"
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="แนบรูปภาพ"
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="พิมพ์ error message หรือคำถามของคุณ... (แนบรูปได้)"
          disabled={disabled}
          rows={1}
        />
        <button type="submit" disabled={disabled || (!text.trim() && !image)}>
          ส่ง
        </button>
      </form>
    </div>
  );
}

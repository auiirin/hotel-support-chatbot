import { useState } from 'react';
import { Link } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow.jsx';
import InputBar from '../components/InputBar.jsx';
import { sendMessageStream } from '../api/chat.js';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  async function handleSend(text, image = null) {
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const userMsg = { role: 'user', content: text, image: image?.previewUrl || null };

    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setIsStreaming(true);
    setError(null);

    try {
      await sendMessageStream(
        text,
        history,
        (chunk) => {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              role: 'assistant',
              content: next[next.length - 1].content + chunk,
            };
            return next;
          });
        },
        () => setIsStreaming(false),
        image,
      );
    } catch {
      setError('เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อกับ server ได้');
      setMessages((prev) => prev.slice(0, -1));
      setIsStreaming(false);
    }
  }

  function handleClear() {
    setMessages([]);
    setError(null);
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">🏨</div>
          <div>
            <h1>Hotel Support Assistant</h1>
            <p>ระบบช่วยเหลือลูกค้า Hotel Management Software</p>
          </div>
        </div>
        <div className="header-actions">
          {messages.length > 0 && (
            <button className="clear-btn" onClick={handleClear}>เริ่มใหม่</button>
          )}
          <Link to="/admin" className="admin-link">Admin</Link>
        </div>
      </header>

      <main className="app-main">
        <ChatWindow messages={messages} isStreaming={isStreaming} />
        {error && <div className="error-banner">{error}</div>}
        <InputBar onSend={handleSend} disabled={isStreaming} />
      </main>
    </div>
  );
}

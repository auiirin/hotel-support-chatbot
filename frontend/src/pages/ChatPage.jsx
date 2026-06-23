import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow.jsx';
import InputBar from '../components/InputBar.jsx';
import LaunchView from '../components/LaunchView.jsx';
import GuideView from '../components/GuideView.jsx';
import { sendMessageStream } from '../api/chat.js';

export default function ChatPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [view, setView] = useState('launch'); // launch | chat | guide
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
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

  async function handleSend(text, img = null) {
    const imageToSend = img || image;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const userMsg = { role: 'user', content: text, image: imageToSend?.previewUrl || null };

    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setView('chat');
    setIsStreaming(true);
    setError(null);
    setImage(null);

    try {
      await sendMessageStream(
        text,
        history,
        (chunk) => {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: 'assistant', content: next[next.length - 1].content + chunk };
            return next;
          });
        },
        () => setIsStreaming(false),
        imageToSend,
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
    setView('launch');
  }

  function handleClose() {
    setPanelOpen(false);
  }

  return (
    <div className="page-bg">
      {/* Floating AI button */}
      <button className="ai-fab" onClick={() => setPanelOpen((o) => !o)} title="Ask Soraso AI">
        {panelOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        ) : (
          'AI'
        )}
      </button>

      {/* Panel */}
      {panelOpen && (
        <>
          <div className="panel-overlay" onClick={handleClose} />
          <div className="app">
            <header className="app-header">
              <div className="header-ai-badge">AI</div>
              <span className="header-title">Ask Soraso</span>
              <div className="header-actions">
                {messages.length > 0 && (
                  <button className="header-icon-btn" onClick={handleClear} title="New chat">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5v14M5 12h14"/>
                    </svg>
                  </button>
                )}
                <Link to="/admin" className="admin-link">Admin</Link>
                <button className="header-icon-btn" onClick={handleClose} title="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </header>

            <main className="app-main">
              {view === 'launch' && (
                <LaunchView
                  onSend={(text) => handleSend(text)}
                  onSendImage={handleSend}
                  disabled={isStreaming}
                  image={image}
                  onAttach={handleImageChange}
                  onRemoveImage={() => setImage(null)}
                  fileInputRef={fileInputRef}
                />
              )}
              {view === 'chat' && (
                <>
                  <ChatWindow
                    messages={messages}
                    isStreaming={isStreaming}
                    onBack={() => setView('launch')}
                    onGuide={() => setView('guide')}
                    onFollowup={(text) => handleSend(text)}
                  />
                  {error && <div className="error-banner">{error}</div>}
                  <InputBar onSend={handleSend} disabled={isStreaming} />
                </>
              )}
              {view === 'guide' && (
                <GuideView
                  onBack={() => setView('chat')}
                  onChat={() => setView('chat')}
                />
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
}

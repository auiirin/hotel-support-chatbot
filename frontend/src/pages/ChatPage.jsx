import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow.jsx';
import InputBar from '../components/InputBar.jsx';
import LaunchView from '../components/LaunchView.jsx';
import GuideView from '../components/GuideView.jsx';
import { sendMessageStream, resolveCase } from '../api/chat.js';
import EscalationForm from '../components/EscalationForm.jsx';

export default function ChatPage() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [view, setView] = useState('launch'); // launch | chat | guide
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);
  const [showEscForm, setShowEscForm] = useState(false);
  const [escLoading, setEscLoading] = useState(false);
  const fileInputRef = useRef(null);
  const receivedContentRef = useRef(false);

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
    // Special internal commands
    if (text === '__resolved__') {
      setMessages((prev) => [...prev, { role: 'user', content: '✅ แก้ไขเรียบร้อยแล้วครับ' }]);
      text = 'แก้ไขเรียบร้อยแล้วครับ ขอบคุณ';
    } else if (text === '__escalate__') {
      setMessages((prev) => [...prev, { role: 'user', content: '❌ ทำตาม Step แล้วยังแก้ไม่ได้ครับ' }]);
      text = 'ทำตาม Step แล้วยังแก้ไม่ได้ครับ ช่วย Escalate ให้ทีม Support ด้วย';
    }

    const imageToSend = img || image;
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    const userMsg = { role: 'user', content: text, image: imageToSend?.previewUrl || null };

    setMessages((prev) => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setView('chat');
    setIsStreaming(true);
    setError(null);
    setImage(null);
    receivedContentRef.current = false;

    try {
      await sendMessageStream(
        text,
        history,
        (chunk) => {
          receivedContentRef.current = true;
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
      if (!receivedContentRef.current) {
        setError('เกิดข้อผิดพลาด ไม่สามารถเชื่อมต่อกับ server ได้');
        setMessages((prev) => prev.slice(0, -1));
      }
      setIsStreaming(false);
    }
  }

  async function handleResolved() {
    const problem = messages.find((m) => m.role === 'user')?.content || '';
    const solution = messages.filter((m) => m.role === 'assistant').map((m) => m.content).join('\n');
    await resolveCase(problem, solution, messages);
    await handleSend('__resolved__');
  }

  function handleEscalate() {
    setShowEscForm(true);
  }

  async function handleEscalateSubmit(formData) {
    setEscLoading(true);
    try {
      const problem = messages.find((m) => m.role === 'user')?.content || '';
      const errorDetail = messages.filter((m) => m.role === 'user').map((m) => m.content).join(' | ');
      const stepsTried = messages.filter((m) => m.role === 'assistant').map((m) => m.content).join('\n---\n');

      await fetch('/api/chat/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, problem, errorDetail, stepsTried }),
      });

      setShowEscForm(false);
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: `❌ ยังแก้ไม่ได้ครับ (${formData.hotelName} — ${formData.reporterName})` },
        { role: 'assistant', content: `ส่งเรื่องให้ทีม Support เรียบร้อยแล้วครับ 📧\n\nทีมจะติดต่อกลับที่ **${formData.contact}** โดยเร็วที่สุดนะครับ ขอโทษที่ทำให้ไม่สะดวกครับ` },
      ]);
    } catch {
      alert('ส่ง Email ไม่สำเร็จ กรุณาลองใหม่อีกครั้งครับ');
    } finally {
      setEscLoading(false);
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

            <main className="app-main" style={{ position: 'relative' }}>
              {showEscForm && (
                <EscalationForm
                  onSubmit={handleEscalateSubmit}
                  onCancel={() => setShowEscForm(false)}
                  isLoading={escLoading}
                />
              )}
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
                    onResolved={handleResolved}
                    onEscalate={handleEscalate}
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

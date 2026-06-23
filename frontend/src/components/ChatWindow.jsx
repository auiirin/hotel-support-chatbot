import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';

export default function ChatWindow({ messages, isStreaming, onBack, onGuide, onFollowup }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showLoading = isStreaming && messages[messages.length - 1]?.content === '';

  const followups = [
    'The encoder still isn\'t detected',
    'How do I duplicate an existing key?',
    'Connect me to live support',
  ];

  return (
    <>
      <div className="chat-subheader">
        <button className="back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 6-6 6 6 6"/>
          </svg>
        </button>
        <span className="context-pill">
          <span className="context-dot" />
          Hotel Support
        </span>
      </div>

      <div className="chat-window">
        {messages.length === 0 && !isStreaming && (
          <div className="empty-state">
            <p>เริ่มพิมพ์คำถามได้เลยครับ</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            content={msg.content}
            image={msg.image || null}
            isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
          />
        ))}
        {showLoading && (
          <div className="message-row assistant">
            <div className="ai-avatar">AI</div>
            <div className="loading-dots">
              <span /><span /><span />
            </div>
          </div>
        )}
        {/* show follow-up chips after last AI message */}
        {!isStreaming && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content && (
          <div className="followups" style={{ marginTop: 8 }}>
            {followups.map((f) => (
              <button key={f} className="followup-chip" onClick={() => onFollowup(f)}>{f}</button>
            ))}
            <button className="followup-chip" onClick={onGuide} style={{ color: '#6a3bd0', borderColor: '#e3deef' }}>
              View troubleshooting guide →
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </>
  );
}

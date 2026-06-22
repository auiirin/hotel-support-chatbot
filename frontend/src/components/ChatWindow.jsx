import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';

export default function ChatWindow({ messages, isStreaming }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastMsg = messages[messages.length - 1];
  const showLoadingDots = isStreaming && lastMsg?.role === 'assistant' && lastMsg?.content === '';

  return (
    <div className="chat-window">
      {messages.length === 0 && (
        <div className="empty-state">
          <p>สวัสดีครับ! ผมคือ Support Assistant ของระบบจัดการโรงแรม</p>
          <p>มีปัญหาหรือข้อสงสัยอะไร ถามได้เลยครับ 😊</p>
        </div>
      )}
      {messages.map((msg, i) => (
        <MessageBubble
          key={i}
          role={msg.role}
          content={msg.content}
          isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
        />
      ))}
      {showLoadingDots && (
        <div className="message-row assistant">
          <div className="bubble loading">
            <span /><span /><span />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

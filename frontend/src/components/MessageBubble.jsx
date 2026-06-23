import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ role, content, image, isStreaming }) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="message-row user">
        <div className="bubble-user">
          {image && <img src={image} alt="รูปที่แนบมา" className="bubble-image" />}
          {content && <span>{content}</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="message-row assistant">
      <div className="ai-avatar">AI</div>
      <div className={`bubble-ai${isStreaming ? ' streaming' : ''}`}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
}

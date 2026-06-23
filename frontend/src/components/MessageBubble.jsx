import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ role, content, image, isStreaming }) {
  const isUser = role === 'user';
  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className={`bubble${isStreaming ? ' streaming' : ''}`}>
        {image && (
          <img src={image} alt="รูปที่แนบมา" className="bubble-image" />
        )}
        {isUser ? (
          content && <p>{content}</p>
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

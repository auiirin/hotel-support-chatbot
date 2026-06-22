import ReactMarkdown from 'react-markdown';

export default function MessageBubble({ role, content, isStreaming }) {
  const isUser = role === 'user';
  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className={`bubble${isStreaming ? ' streaming' : ''}`}>
        {isUser ? (
          <p>{content}</p>
        ) : (
          <ReactMarkdown>{content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

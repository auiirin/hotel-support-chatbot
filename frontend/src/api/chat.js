export async function sendMessage(message, history) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error('Failed to get response');
  return res.json();
}

export async function sendMessageStream(message, history, onChunk, onDone) {
  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) throw new Error('Failed to connect to stream');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop();

    for (const part of parts) {
      if (!part.startsWith('data: ')) continue;
      const data = JSON.parse(part.slice(6));
      if (data.error) throw new Error(data.error);
      if (data.done) onDone(data.sources || []);
      else onChunk(data.text);
    }
  }
}

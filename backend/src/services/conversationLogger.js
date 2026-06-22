import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.resolve(__dirname, '../../data/conversations.jsonl');

function ensureDir() {
  const dir = path.dirname(LOG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export function logConversation(entry) {
  ensureDir();
  fs.appendFileSync(LOG_FILE, JSON.stringify({ ...entry, timestamp: new Date().toISOString() }) + '\n');
}

export function getConversations(limit = 100) {
  if (!fs.existsSync(LOG_FILE)) return [];
  const content = fs.readFileSync(LOG_FILE, 'utf-8').trim();
  if (!content) return [];
  return content
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l))
    .slice(-limit)
    .reverse();
}

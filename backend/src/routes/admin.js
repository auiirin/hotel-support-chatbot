import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAdmin } from '../middleware/adminAuth.js';
import { getConversations } from '../services/conversationLogger.js';
import { getDocumentList } from '../services/search.js';
import { ingestFile, deleteFileFromIndex } from '../services/ingest.js';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDFS_DIR = path.resolve(__dirname, '../../../pdfs');

const storage = multer.diskStorage({
  destination: PDFS_DIR,
  filename: (_req, file, cb) => cb(null, file.originalname),
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
  limits: { fileSize: 50 * 1024 * 1024 },
});

const router = Router();

router.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === config.adminSecret) {
    res.json({ token: config.adminSecret });
  } else {
    res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }
});

router.get('/documents', requireAdmin, async (_req, res) => {
  try {
    const documents = await getDocumentList();
    res.json({ documents });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload', requireAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'ไม่พบไฟล์ที่อัปโหลด' });
  try {
    const result = await ingestFile(req.file.path);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Ingest error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/documents/:id', requireAdmin, async (req, res) => {
  try {
    await deleteFileFromIndex(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/conversations', requireAdmin, (_req, res) => {
  const conversations = getConversations(100);
  res.json({ conversations });
});

export default router;

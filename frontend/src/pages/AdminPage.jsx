import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

const TOKEN_KEY = 'admin_token';

function api(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return fetch(`/api/admin${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

// ─── Login ───────────────────────────────────────────────────────────────────
function LoginForm({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      localStorage.setItem(TOKEN_KEY, data.token);
      onLogin();
    } else {
      setError(data.error || 'Login failed');
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-logo">🏨</div>
        <h2>Admin Panel</h2>
        <p>Hotel Support Chatbot</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <div className="admin-error">{error}</div>}
          <button type="submit" disabled={loading || !password}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <Link to="/" className="back-link">← กลับหน้าแชท</Link>
      </div>
    </div>
  );
}

// ─── Documents Tab ────────────────────────────────────────────────────────────
function DocumentsTab() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api('/documents');
    if (res.ok) {
      const data = await res.json();
      setDocs(data.documents);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(doc) {
    if (!confirm(`ลบ "${doc.filename}" ออกจากระบบ?`)) return;
    setDeleting(doc.id);
    await api(`/documents/${doc.id}`, { method: 'DELETE' });
    setDeleting(null);
    load();
  }

  if (loading) return <div className="admin-loading">กำลังโหลด...</div>;

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h3>เอกสารในระบบ ({docs.length})</h3>
        <button className="refresh-btn" onClick={load}>↻ รีเฟรช</button>
      </div>
      {docs.length === 0 ? (
        <div className="admin-empty">ยังไม่มีเอกสารในระบบ</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>ชื่อไฟล์</th><th>ประเภท</th><th>อัปโหลดเมื่อ</th><th></th></tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td>📄 {d.filename}</td>
                <td>{d.file_type}</td>
                <td>{new Date(d.uploaded_at).toLocaleDateString('th-TH')}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(d)}
                    disabled={deleting === d.id}
                  >
                    {deleting === d.id ? '...' : 'ลบ'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Upload Tab ───────────────────────────────────────────────────────────────
function UploadTab() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api('/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: `อัปโหลดสำเร็จ: ${data.filename} (${data.chunks} chunks)` });
        setFile(null);
        e.target.reset();
      } else {
        setStatus({ type: 'error', message: data.error || 'Upload failed' });
      }
    } catch {
      setStatus({ type: 'error', message: 'เกิดข้อผิดพลาดในการอัปโหลด' });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin-section">
      <h3>อัปโหลดเอกสาร PDF</h3>
      <p className="upload-hint">ระบบจะแปลงไฟล์เป็น Embeddings และเพิ่มเข้า Knowledge Base โดยอัตโนมัติ</p>
      <form className="upload-form" onSubmit={handleUpload}>
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={uploading}
        />
        <button type="submit" disabled={!file || uploading} className="upload-btn">
          {uploading ? '⏳ กำลังประมวลผล...' : '⬆ อัปโหลดและ Ingest'}
        </button>
      </form>
      {status && (
        <div className={`admin-status ${status.type}`}>{status.message}</div>
      )}
      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar"><div className="progress-fill" /></div>
          <p>กำลัง embed เอกสาร อาจใช้เวลาสักครู่...</p>
        </div>
      )}
    </div>
  );
}

// ─── Conversations Tab ────────────────────────────────────────────────────────
function ConversationsTab() {
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await api('/conversations');
      if (res.ok) {
        const data = await res.json();
        setConvs(data.conversations);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="admin-loading">กำลังโหลด...</div>;

  return (
    <div className="admin-section">
      <h3>ประวัติการสนทนา ({convs.length})</h3>
      {convs.length === 0 ? (
        <div className="admin-empty">ยังไม่มีประวัติการสนทนา</div>
      ) : (
        <div className="conv-list">
          {convs.map((c, i) => (
            <div key={i} className="conv-item" onClick={() => setExpanded(expanded === i ? null : i)}>
              <div className="conv-header">
                <span className="conv-time">{new Date(c.timestamp).toLocaleString('th-TH')}</span>
                <span className="conv-question">{c.message}</span>
                <span className="conv-toggle">{expanded === i ? '▲' : '▼'}</span>
              </div>
              {expanded === i && (
                <div className="conv-body">
                  <div className="conv-label">คำถาม:</div>
                  <div className="conv-text user">{c.message}</div>
                  <div className="conv-label">คำตอบ:</div>
                  <div className="conv-text assistant">{c.answer}</div>
                  {c.sources?.length > 0 && (
                    <>
                      <div className="conv-label">แหล่งข้อมูล:</div>
                      <div className="conv-sources">{c.sources.join(', ')}</div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem(TOKEN_KEY));
  const [tab, setTab] = useState('documents');

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) return <LoginForm onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="header-left">
          <div className="logo">🏨</div>
          <div>
            <h1>Admin Panel</h1>
            <p>Hotel Support Chatbot</p>
          </div>
        </div>
        <div className="header-actions">
          <Link to="/" className="admin-link">← หน้าแชท</Link>
          <button className="clear-btn" onClick={handleLogout}>ออกจากระบบ</button>
        </div>
      </header>

      <nav className="admin-nav">
        {[
          { id: 'documents', label: '📄 เอกสาร' },
          { id: 'upload', label: '⬆ อัปโหลด' },
          { id: 'conversations', label: '💬 การสนทนา' },
        ].map((t) => (
          <button
            key={t.id}
            className={`tab-btn${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="admin-main">
        {tab === 'documents' && <DocumentsTab />}
        {tab === 'upload' && <UploadTab />}
        {tab === 'conversations' && <ConversationsTab />}
      </main>
    </div>
  );
}

export default function GuideView({ topic, onBack, onChat }) {
  const steps = [
    'Check the key encoder is connected — its status should read "Connected" in the top bar.',
    'Confirm the guest is checked in and today falls within the stay dates.',
    'Load a fresh blank card and reseat it in the encoder tray.',
    'Open the room card → Key icon → choose New or Duplicate, then set the date range.',
    'If you see "Encoder timeout", restart Key Service in Settings → Devices → Key Encoder.',
  ];

  return (
    <>
      <div className="guide-subheader">
        <button className="back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m15 6-6 6 6 6"/>
          </svg>
        </button>
        <span className="guide-subheader-title">Troubleshooting guide</span>
      </div>

      <div className="guide-body">
        <div className="guide-hero">
          <span className="guide-tag">TROUBLESHOOTING</span>
          <div className="guide-title">{topic || 'Gen Key Card error'}</div>
          <div className="guide-subtitle">Resolve key-card generation issues in 5 steps</div>
        </div>

        <div className="guide-content">
          <div className="steps-label">Steps</div>
          <div className="steps-list">
            {steps.map((s, i) => (
              <div key={i} className="step-row">
                <span className="step-num">{i + 1}</span>
                <span>{s}</span>
              </div>
            ))}
          </div>

          <div className="video-card">
            <div className="video-thumbnail">
              <span className="video-play-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#2a2a35"><path d="M7 5v14l11-7z"/></svg>
              </span>
              <span className="video-duration">2:14</span>
            </div>
            <div className="video-info">
              <div className="video-title">Generating Key Cards</div>
              <div className="video-meta">VDO Training · Front desk basics</div>
            </div>
          </div>

          <button className="article-btn" onClick={onChat}>
            <span className="article-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6a3bd0" strokeWidth="1.8">
                <path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2H4z"/>
                <path d="M20 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2H20z"/>
              </svg>
            </span>
            <span style={{ flex: 1 }}>
              <span className="article-title">Open full article</span>
              <span className="article-sub">Soraso Manual › Key Cards</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2">
              <path d="m9 6 6 6-6 6"/>
            </svg>
          </button>

          <div className="escalation-card">
            <div className="escalation-title">Still stuck?</div>
            <div className="escalation-body">Start a live session with a Soraso support agent.</div>
            <button className="contact-btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M4 13a8 8 0 0 1 16 0M4 13v3a2 2 0 0 0 2 2h1v-5H6a2 2 0 0 0-2 0zM20 13v3a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 0z"/>
              </svg>
              Contact support
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

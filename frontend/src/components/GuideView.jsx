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
            <div className="escalation-body">ติดต่อทีม Soraso AI Specialist ได้เลยครับ</div>
            <div className="escalation-contacts">
              <a className="contact-link" href="https://line.me/R/ti/p/@soraso" target="_blank" rel="noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M12 2C6.48 2 2 5.92 2 10.72c0 3.25 2.08 6.1 5.22 7.72-.2.76-.74 2.76-.85 3.19-.14.54.2.54.42.39.17-.11 2.72-1.84 3.83-2.6.44.06.89.1 1.38.1 5.52 0 10-3.92 10-8.72S17.52 2 12 2z"/></svg>
                Line OA: @soraso
              </a>
              <a className="contact-link" href="mailto:support@soraso.tech">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M4 4h16v16H4z"/><path d="m4 4 8 9 8-9"/></svg>
                support@soraso.tech
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

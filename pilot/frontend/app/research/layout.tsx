import Link from 'next/link';

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell research-shell">
      <header className="site-header-r">
        <div className="wrap">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0 4px', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/research" className="brand">గ్రామవాణి <small>Pilot — Research</small></Link>
            <Link href="/" className="subtle-link">← Worker view</Link>
          </div>
          <nav className="research-nav" aria-label="Research navigation">
            <Link href="/research">Overview</Link>
            <Link href="/research/diagnostics">Diagnostics</Link>
            <Link href="/research/scenarios">Scenarios</Link>
            <Link href="/research/evaluation">Evaluation</Link>
            <Link href="/research/feedback">Feedback</Link>
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="wrap stack-lg">
          <div className="notice notice-warn small" role="note">
            <strong>Researcher / developer area.</strong> Technical tools, diagnostics, and synthetic test data. Not part of the normal worker journey. Experimental pilot — not official, not submitted.
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
import Link from 'next/link';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="wrap topbar-inner">
          <Link href="/" className="brand">గ్రామవాణి <small>Pilot</small></Link>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/history" className="subtle-link">చరిత్ర (History)</Link>
            <Link href="/research" className="subtle-link">పరిశోధకులు / Researcher</Link>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="wrap stack-lg">
          <div className="notice notice-warn small" role="note">
            <strong>ప్రయోగాత్మక నమూనా (Pilot)</strong>
            <div>ఇది అధికారిక వ్యవస్థ కాదు. ప్రభుత్వానికి సమర్పించబడదు. Synthetic / గుర్తింపు లేని సమాచారం మాత్రమే ఉపయోగించండి.</div>
            <div className="muted">Experimental sample only — not official, not submitted. No government integration.</div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
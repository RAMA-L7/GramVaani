import Link from 'next/link';

export default function ResearchHome() {
  return (
    <div className="stack-lg">
      <section className="card stack">
        <h1>Research & diagnostics</h1>
        <p className="muted">Developer/researcher tools separated from the worker-facing flow. Use synthetic or non-identifying data only. No government integration.</p>
      </section>
      <section className="grid" style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <Link href="/research/diagnostics" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2>Diagnostics</h2>
          <p className="small muted">Backend health, ASR provider capabilities, configuration/credential status (technical).</p>
        </Link>
        <Link href="/research/scenarios" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2>Test scenarios</h2>
          <p className="small muted">Load synthetic transcripts/utterances into the workflow for flow testing.</p>
        </Link>
        <Link href="/research/evaluation" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2>Evaluation results</h2>
          <p className="small muted">Metrics and summaries (synthetic vs real speech clearly indicated).</p>
        </Link>
        <Link href="/research/feedback" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2>Feedback</h2>
          <p className="small muted">Submit non-identifying pilot research feedback.</p>
        </Link>
      </section>
      <section className="card stack">
        <h2>Worker flow (for reference)</h2>
        <p className="small muted">The simplified worker journey is: Home → Speak → Review → Questions → Sample report → Done.</p>
        <Link href="/" className="btn btn-primary">Open worker home</Link>
      </section>
    </div>
  );
}
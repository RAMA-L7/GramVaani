import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <span className="tag">EXPERIMENTAL PILOT · SYNTHETIC / NON-IDENTIFYING TESTING</span>
        <h1>GramVaani Pilot</h1>
        <p>
          Worker-friendly Telugu voice reporting workflow: record speech, review transcript, extract and confirm
          structured fields, and generate a clearly labeled <strong>sample report</strong>. No government integration or submission.
        </p>
      </section>

      <section className="card">
        <h2>Pilot workflow</h2>
        <div className="grid grid-3">
          <Link href="/voice" className="tile">
            <h3>1. Voice reporting</h3>
            <p className="muted small">Record with your microphone (start/pause/resume/stop), play back, re-record, and transcribe via backend ASR or browser speech recognition where available.</p>
          </Link>
          <Link href="/transcript" className="tile">
            <h3>2. Transcript review</h3>
            <p className="muted small">See Telugu/mixed text, edit manually, preserve English terms, correct words, keep original transcript, and re-run extraction.</p>
          </Link>
          <Link href="/preview" className="tile">
            <h3>3. Sample report</h3>
            <p className="muted small">Review grounded values with source spans, resolve clarifications, explicitly confirm, save draft, export JSON. Experimental only.</p>
          </Link>
        </div>
      </section>

      <section className="card">
        <h2>Testing and research</h2>
        <div className="grid grid-3">
          <Link href="/test-scenarios" className="tile">
            <h3>Test scenarios</h3>
            <p className="muted small">Load synthetic test utterances/transcripts for flow testing. Clearly labeled synthetic.</p>
          </Link>
          <Link href="/evaluation" className="tile">
            <h3>Evaluation results</h3>
            <p className="muted small">View backend/file-based evaluation summaries. Distinguishes simulated/synthetic tests from real speech evaluation.</p>
          </Link>
          <Link href="/feedback" className="tile">
            <h3>Research feedback</h3>
            <p className="muted small">Submit simple pilot feedback to the backend to support research and improvement.</p>
          </Link>
        </div>
      </section>

      <section className="card">
        <h2>Important boundaries</h2>
        <div className="notice">
          <strong>Not official / not submitted.</strong> This pilot generates sample reports for evaluation only. It does not connect to Poshan Tracker, Bala Sanjeevini, or any government system.
        </div>
        <ul className="small muted">
          <li>Use synthetic or non-identifying data only during testing.</li>
          <li>Speech recognition depends on selected provider/browser capabilities; unavailable providers must show clear status and are never faked.</li>
          <li>Worker must review and explicitly confirm extracted values before any sample report is generated.</li>
        </ul>
        <div className="btn-row">
          <Link href="/voice" className="btn btn-primary">Start voice reporting</Link>
          <Link href="/test-scenarios" className="btn">Open synthetic scenarios</Link>
        </div>
      </section>
    </div>
  );
}

import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <span className="tag">EXPERIMENTAL MODULE · SIMULATED</span>
        <h1>GramVaani Sandbox</h1>
        <p>
          A safe, simulated environment to see whether Telugu voice input, structured extraction,
          validation and API-based data transfer work reliably — with synthetic data only.
        </p>
      </section>

      <section className="card">
        <h2>What this is, and why</h2>
        <p>
          We built a simulated reporting environment to evaluate whether Telugu voice input, structured
          extraction, validation and API-based data transfer work reliably. Actual government workflow
          compatibility remains subject to field validation and authorization.
        </p>
        <div className="notice">
          <strong>Not an official system.</strong> This is a hackathon sandbox. It does not connect to
          Poshan Tracker or Bala Sanjeevini, it has no real speech recognition, and it contains no
          beneficiary data. All transcripts are scripted and all records are synthetic.
        </div>
      </section>

      <section>
        <h2>Three components</h2>
        <div className="grid grid-3">
          <Link href="/voice" className="tile">
            <h3>1. Voice Assistant</h3>
            <p className="muted">Pick a scripted scenario, “record”, edit the transcript, review extraction, answer clarifications, confirm, then submit through the gateway.</p>
          </Link>
          <Link href="/reporting" className="tile">
            <h3>2. Reporting App</h3>
            <p className="muted">A generic dummy manual-entry form for a synthetic worker and centre, with validation and gateway submission.</p>
          </Link>
          <Link href="/dashboard" className="tile">
            <h3>3. Dashboard</h3>
            <p className="muted">A dummy receiving application showing what arrived through the simulated gateway. Not a government system.</p>
          </Link>
        </div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <h2>Claim rules</h2>
        <div className="claim-box">
          <blockquote>
            “We built a simulated reporting environment to evaluate whether Telugu voice input,
            structured extraction, validation and API-based data transfer work reliably. Actual
            government workflow compatibility remains subject to field validation and authorization.”
          </blockquote>
        </div>
        <h3 className="small">Do not claim</h3>
        <ul className="small forbidden muted">
          <li>Poshan Tracker or Bala Sanjeevini integration</li>
          <li>Official requirements verified or government approval</li>
          <li>Proven workload reduction</li>
          <li>Live speech recognition or real beneficiary data</li>
        </ul>
      </section>

      <section className="card">
        <h2>How to run</h2>
        <p className="small muted">
          Start the sandbox backend on <code>http://localhost:8000</code>, then run this frontend on
          <code> http://localhost:3000</code> with <code>pnpm install</code> and <code>pnpm dev</code>.
        </p>
        <div className="btn-row">
          <Link href="/voice" className="btn btn-primary">Open Voice Assistant</Link>
          <Link href="/dashboard" className="btn">View Dashboard</Link>
        </div>
      </section>
    </div>
  );
}

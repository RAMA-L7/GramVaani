'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { EvaluationSummary } from '@/lib/types';
import { errorMessage } from '@/lib/utils';

export default function EvaluationPage() {
  const [data, setData] = useState<EvaluationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.evaluationSummary()
      .then((res) => { if (active) setData(res); })
      .catch((err) => { if (active) setError(errorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const isSynthetic = !!(data?.synthetic || data?.simulated);
  const hasReal = !!data?.real_speech;

  return (
    <div>
      <h1>Evaluation results</h1>
      <p className="muted">Displays evaluation summary/metrics from backend or file-based results when available. Clearly distinguishes synthetic/simulated tests from real speech evaluation.</p>

      {loading && <p className="muted">Loading evaluation summary…</p>}
      {error && <div className="error">Could not load evaluation summary: {error}</div>}

      {!loading && !error && (!data || data.available === false) && (
        <section className="card">
          <div className="notice"><strong>No real speech evaluation results available.</strong> {data?.message || 'Backend did not report available evaluation results.'}</div>
          <p className="small muted">When results exist, this page will show whether they come from synthetic/simulated tests or real speech evaluation. Do not interpret absence as success.</p>
        </section>
      )}

      {data && data.available !== false && (
        <>
          <section className="card">
            <h2>Result type</h2>
            <div className="btn-row" style={{ marginTop: 0 }}>
              <span className={`badge ${isSynthetic ? 'badge-warn' : 'badge-info'}`}>{isSynthetic ? 'SIMULATED / SYNTHETIC TESTS' : 'TEST TYPE UNSPECIFIED'}</span>
              <span className={`badge ${hasReal ? 'badge-ok' : 'badge-warn'}`}>{hasReal ? 'INCLUDES REAL SPEECH EVALUATION' : 'NO REAL SPEECH EVALUATION INDICATED'}</span>
            </div>
            {!hasReal && <div className="notice" style={{ marginTop: 12 }}><strong>No real speech evaluation indicated.</strong> Metrics below should be treated as synthetic/simulated or unspecified unless explicitly marked as real speech.</div>}
            {isSynthetic && <p className="small muted" style={{ marginTop: 8 }}>These results include simulated/synthetic testing. Synthetic results are useful for flow/logic checks but are not evidence of real-world speech performance.</p>}
            {data.updated_at && <p className="hint">Updated: {data.updated_at}</p>}
            {data.source && <p className="hint">Source: {data.source}</p>}
            {data.message && <p>{data.message}</p>}
          </section>

          {data.metrics && (
            <section className="card">
              <h2>Metrics</h2>
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th>Metric</th><th>Value</th></tr></thead>
                  <tbody>
                    {Object.entries(data.metrics).map(([k, v]) => (
                      <tr key={k}><td><code>{k}</code></td><td>{typeof v === 'object' ? <pre className="json" style={{ margin: 0 }}>{JSON.stringify(v, null, 2)}</pre> : String(v)}</td></tr>
                    ))}
                    {Object.keys(data.metrics).length === 0 && <tr><td colSpan={2} className="muted">No metrics provided.</td></tr>}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {data.runs && data.runs.length > 0 && (
            <section className="card">
              <h2>Runs / cases</h2>
              <pre className="json">{JSON.stringify(data.runs, null, 2)}</pre>
            </section>
          )}

          {data.notes && data.notes.length > 0 && (
            <section className="card">
              <h2>Notes</h2>
              <ul>{data.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </section>
          )}

          <section className="card">
            <h2>Raw summary</h2>
            <pre className="json">{JSON.stringify(data, null, 2)}</pre>
          </section>
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { EvaluationSummary } from '@/lib/types';
import { errorMessage } from '@/lib/utils';

export default function ResearchEvaluationPage() {
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
    <div className="stack-lg">
      <h1>Evaluation results</h1>
      <p className="muted">Metrics/summaries from backend or file-based results. Synthetic/simulated tests are clearly distinguished from real speech evaluation. No fabricated accuracy.</p>
      {loading && <p className="muted">Loading…</p>}
      {error && <div className="notice notice-error">Could not load: {error}</div>}
      {!loading && !error && (!data || data.available === false) && (
        <section className="card"><div className="notice notice-warn"><strong>No real speech evaluation results available.</strong> {data?.message || 'No results reported.'}</div></section>
      )}
      {data && data.available !== false && (
        <>
          <section className="card stack">
            <h2>Result type</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span className={`pill ${isSynthetic ? 'pill-warn' : 'pill-info'}`}>{isSynthetic ? 'SYNTHETIC/SIMULATED' : 'TYPE UNSPECIFIED'}</span>
              <span className={`pill ${hasReal ? 'pill-ok' : 'pill-warn'}`}>{hasReal ? 'INCLUDES REAL SPEECH' : 'NO REAL SPEECH INDICATED'}</span>
            </div>
            {data.message && <p>{data.message}</p>}
          </section>
          {data.metrics && (
            <section className="card stack">
              <h2>Metrics</h2>
              <div className="table-scroll"><table className="data-table"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>
                {Object.entries(data.metrics).map(([k, v]) => (<tr key={k}><td><code>{k}</code></td><td>{typeof v === 'object' ? <pre className="json" style={{ margin: 0 }}>{JSON.stringify(v, null, 2)}</pre> : String(v)}</td></tr>))}
              </tbody></table></div>
            </section>
          )}
          {data.runs && data.runs.length > 0 && <section className="card"><h2>Runs</h2><pre className="json">{JSON.stringify(data.runs, null, 2)}</pre></section>}
          {data.notes && data.notes.length > 0 && <section className="card"><h2>Notes</h2><ul style={{ margin: 0, paddingLeft: 20 }}>{data.notes.map((n, i) => <li key={i}>{n}</li>)}</ul></section>}
          <section className="card"><h2>Raw summary</h2><pre className="json">{JSON.stringify(data, null, 2)}</pre></section>
        </>
      )}
    </div>
  );
}
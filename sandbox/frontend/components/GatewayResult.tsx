'use client';

import type { GatewayResultData } from '@/lib/api';

interface Props {
  result: GatewayResultData | null;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onReset?: () => void;
  title?: string;
}

export default function GatewayResult({ result, loading, error, onRetry, onReset, title }: Props) {
  if (!result && !error && !loading) return null;

  let badge = 'badge-info';
  if (result?.status === 'accepted') badge = 'badge-ok';
  if (result?.status === 'duplicate') badge = 'badge-info';
  if (result?.status === 'rejected') badge = 'badge-err';

  return (
    <section className="card">
      <h2><span className="step">8</span> {title || 'Gateway submission'}</h2>
      {loading && <p className="muted">Submitting to the simulated gateway…</p>}
      {error && (
        <div>
          <p className="error">Submission failed: {error}</p>
          {onRetry && <button type="button" className="btn btn-small" onClick={onRetry}>Retry with same idempotency key</button>}
        </div>
      )}
      {result && (
        <div>
          <p>
            <span className={`badge ${badge}`}>{result.status}</span>
          </p>
          <dl className="report-grid">
            <dt>Receipt id</dt><dd><code>{result.receipt_id || '—'}</code></dd>
            <dt>Status</dt><dd>{result.status}</dd>
          </dl>
          {result.errors && result.errors.length > 0 && (
            <div className="error">
              <strong>Gateway errors</strong>
              <ul>{result.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
            </div>
          )}
          {result.dashboard_entry !== undefined && (
            <details>
              <summary className="small muted">Dashboard entry (simulated)</summary>
              <pre className="json">{JSON.stringify(result.dashboard_entry, null, 2)}</pre>
            </details>
          )}
          <div className="btn-row">
            {onRetry && <button type="button" className="btn btn-small" onClick={onRetry}>Retry with same key</button>}
            {onReset && <button type="button" className="btn btn-small" onClick={onReset}>Start over</button>}
          </div>
        </div>
      )}
    </section>
  );
}

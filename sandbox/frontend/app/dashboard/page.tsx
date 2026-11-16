'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  api, displayValue, errorMessage, labelFor,
  type DashboardEntry,
} from '@/lib/api';

export default function DashboardPage() {
  const [entries, setEntries] = useState<DashboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api.gatewayReports()
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h1>Dummy reporting dashboard</h1>
      <p className="muted">
        <strong>Simulated receiving application — not a government system.</strong> This shows only
        what arrived through the sandbox gateway. Records are synthetic and are not official reports.
      </p>

      <div className="btn-row">
        <button type="button" className="btn btn-small" onClick={load} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="error" style={{ marginTop: 14 }}>Could not load submissions: {error}</p>}
      {loading && <p className="muted" style={{ marginTop: 14 }}>Loading received submissions…</p>}

      {!loading && !error && entries.length === 0 && (
        <section className="card" style={{ marginTop: 14 }}>
          <h2>No submissions yet</h2>
          <p className="muted">
            Nothing has arrived through the simulated gateway. Submit a report from the
            {' '}<a href="/voice">Voice Assistant</a> or the {' '}
            <a href="/reporting">Reporting App</a> to see it here.
          </p>
        </section>
      )}

      {!loading && entries.length > 0 && (
        <section style={{ marginTop: 14 }}>
          <h2>Received submissions ({entries.length})</h2>
          {entries.map((entry) => {
            const report = entry.report || ({} as DashboardEntry['report']);
            const fields = Object.entries(report.fields || {});
            let statusClass = 'badge-info';
            if (entry.status === 'accepted') statusClass = 'badge-ok';
            if (entry.status === 'rejected') statusClass = 'badge-err';
            return (
              <article className="receipt-card" key={entry.receipt_id}>
                <div className="receipt-head">
                  <div>
                    <span className="muted small">Receipt id</span><br />
                    <code>{entry.receipt_id}</code>
                  </div>
                  <span className={`badge ${statusClass}`}>{entry.status}</span>
                </div>
                <p className="small muted" style={{ marginBottom: 10 }}>
                  Submitted at: {entry.submitted_at}
                </p>
                <dl className="report-grid">
                  <dt>Worker (synthetic)</dt><dd>{report.worker?.worker_code || '—'}</dd>
                  <dt>Centre (synthetic)</dt><dd>{report.worker?.centre_code || '—'}</dd>
                  <dt>Report date</dt><dd>{report.report_date || '—'}</dd>
                  <dt>Transcript ref</dt><dd>{displayValue(report.transcript_ref)}</dd>
                  <dt>Confirmed by</dt><dd>{report.confirmation?.confirmed_by || '—'}</dd>
                  <dt>Confirmed at</dt><dd>{report.confirmation?.confirmed_at || '—'}</dd>
                </dl>
                <h3>Report fields</h3>
                <div className="table-scroll">
                  <table className="data-table">
                    <thead><tr><th>Field</th><th>Value</th></tr></thead>
                    <tbody>
                      {fields.map(([key, value]) => (
                        <tr key={key}>
                          <td>{labelFor(key)}<br /><code className="small">{key}</code></td>
                          <td>{displayValue(value)}</td>
                        </tr>
                      ))}
                      {fields.length === 0 && <tr><td colSpan={2} className="muted">No fields present.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <p className="hint" style={{ marginTop: 14 }}>
        Data shown here persists in the sandbox backend&apos;s local SQLite store and survives restarts.
      </p>
    </div>
  );
}

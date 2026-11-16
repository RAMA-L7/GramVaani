'use client';

import { displayValue, labelFor, type SandboxReport, type Validation } from '@/lib/api';

interface Props {
  report: SandboxReport;
  validation: Validation;
}

export default function ReportPreview({ report, validation }: Props) {
  const entries = Object.entries(report.fields || {});
  return (
    <section className="card">
      <h2><span className="step">7</span> Generated report</h2>
      <div className={`validation ${validation.valid ? 'valid' : 'invalid'}`}>
        <strong>{validation.valid ? 'Validation passed' : 'Validation found problems'}</strong>
        {validation.errors && validation.errors.length > 0 && (
          <ul>
            {validation.errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        )}
      </div>

      <dl className="report-grid">
        <dt>Schema version</dt><dd>{report.schema_version}</dd>
        <dt>Worker (synthetic)</dt><dd>{report.worker?.worker_code || '—'}</dd>
        <dt>Centre (synthetic)</dt><dd>{report.worker?.centre_code || '—'}</dd>
        <dt>Report date</dt><dd>{report.report_date}</dd>
        <dt>Transcript ref</dt><dd>{report.transcript_ref || '—'}</dd>
        <dt>Status</dt><dd>{report.status}</dd>
        <dt>Confirmed by</dt><dd>{report.confirmation?.confirmed_by || '—'}</dd>
        <dt>Confirmed at</dt><dd>{report.confirmation?.confirmed_at || '—'}</dd>
      </dl>

      <h3>Report fields</h3>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr><th>Field</th><th>Value</th></tr>
          </thead>
          <tbody>
            {entries.map(([key, value]) => (
              <tr key={key}>
                <td>{labelFor(key)}<br /><code className="small">{key}</code></td>
                <td>{displayValue(value)}</td>
              </tr>
            ))}
            {entries.length === 0 && <tr><td colSpan={2} className="muted">No fields present.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

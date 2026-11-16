'use client';

import { displayValue, labelFor, teLabelFor } from '@/lib/utils';
import type { PilotReport, Validation } from '@/lib/types';

interface Props {
  report: PilotReport;
  validation?: Validation | null;
}

export default function ReportPreview({ report, validation }: Props) {
  const entries = Object.entries(report.fields || {});
  return (
    <section className="card">
      <h2>Sample report preview / నమూనా నివేదిక</h2>
      <div className="sample-stamp" role="status">
        EXPERIMENTAL SAMPLE REPORT — NOT OFFICIAL · NOT SUBMITTED TO ANY GOVERNMENT SYSTEM<br />
        ప్రయోగాత్మక నమూనా నివేదిక — అధికారికం కాదు · ఏ ప్రభుత్వ వ్యవస్థకూ సమర్పించబడలేదు
      </div>
      {validation && (
        <div className={validation.valid ? 'success' : 'error'}>
          <strong>{validation.valid ? 'Validation passed (pilot checks)' : 'Validation issues found'}</strong>
          {validation.errors?.length ? <ul>{validation.errors.map((e, i) => <li key={i}>{e}</li>)}</ul> : null}
          {validation.warnings?.length ? <ul>{validation.warnings.map((w, i) => <li key={i}>Warning: {w}</li>)}</ul> : null}
        </div>
      )}
      <dl className="report-grid">
        <dt>Label</dt><dd>{report.label || 'Pilot sample report'}</dd>
        <dt>Schema</dt><dd>{report.schema_version || 'pilot'}</dd>
        <dt>Worker (if provided)</dt><dd>{report.worker?.worker_code || '—'}</dd>
        <dt>Centre (if provided)</dt><dd>{report.worker?.centre_code || '—'}</dd>
        <dt>Report date</dt><dd>{report.report_date || '—'}</dd>
        <dt>Status</dt><dd>{report.status || 'draft/sample'}</dd>
        <dt>Confirmed by</dt><dd>{report.confirmation?.confirmed_by || '—'}</dd>
        <dt>Confirmed at</dt><dd>{report.confirmation?.confirmed_at || '—'}</dd>
      </dl>
      <h3>Fields</h3>
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>Field</th><th>Value</th></tr></thead>
          <tbody>
            {entries.map(([k, v]) => (
              <tr key={k}><td>{labelFor(k)}{teLabelFor(k) ? <><br /><span className="muted small">{teLabelFor(k)}</span></> : null}<br /><code className="small">{k}</code></td><td>{displayValue(v)}</td></tr>
            ))}
            {entries.length === 0 && <tr><td colSpan={2} className="muted">No fields.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="hint" style={{ marginTop: 10 }}>Footer: This is an experimental sample report generated for pilot testing. It has not been submitted to any official/government system.</p>
    </section>
  );
}

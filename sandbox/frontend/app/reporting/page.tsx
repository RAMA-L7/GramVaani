'use client';

import { useState } from 'react';
import GatewayResult from '@/components/GatewayResult';
import {
  ACTIVITY_OPTIONS, api, errorMessage, newIdempotencyKey,
  type GatewayResultData, type SandboxReport,
} from '@/lib/api';

export default function ReportingPage() {
  const [workerCode, setWorkerCode] = useState('SYN-W001');
  const [centreCode, setCentreCode] = useState('SYN-C001');
  const [reportDate, setReportDate] = useState('2026-11-16');
  const [activities, setActivities] = useState<string[]>(['pre_school']);
  const [childrenEnrolled, setChildrenEnrolled] = useState('30');
  const [childrenPresent, setChildrenPresent] = useState('24');
  const [childrenAbsent, setChildrenAbsent] = useState('3');
  const [mealServed, setMealServed] = useState(true);
  const [mealCount, setMealCount] = useState('24');
  const [preschoolActivity, setPreschoolActivity] = useState('');
  const [photoAttached, setPhotoAttached] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitKey] = useState(() => newIdempotencyKey('report'));
  const [gatewayResult, setGatewayResult] = useState<GatewayResultData | null>(null);
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggleActivity(value: string) {
    setActivities((prev) => prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]);
  }

  function validate(): string[] {
    const errors: string[] = [];
    if (!workerCode.trim()) errors.push('Synthetic worker code is required.');
    if (!centreCode.trim()) errors.push('Synthetic centre code is required.');
    if (!reportDate) errors.push('Report date is required.');
    if (activities.length === 0) errors.push('Select at least one activity.');

    const enrolled = childrenEnrolled.trim() === '' ? null : Number(childrenEnrolled);
    const present = Number(childrenPresent);
    const absent = childrenAbsent.trim() === '' ? null : Number(childrenAbsent);
    const meals = mealCount.trim() === '' ? null : Number(mealCount);

    if (childrenPresent.trim() === '' || Number.isNaN(present) || present < 0 || present > 200) {
      errors.push('Children present must be a number between 0 and 200.');
    }
    if (enrolled !== null && (Number.isNaN(enrolled) || enrolled < 0 || enrolled > 200)) {
      errors.push('Children enrolled must be between 0 and 200.');
    }
    if (absent !== null && (Number.isNaN(absent) || absent < 0 || absent > 200)) {
      errors.push('Children absent must be between 0 and 200.');
    }
    if (enrolled !== null && !Number.isNaN(present) && absent !== null && present + absent > enrolled) {
      errors.push('Children present + absent cannot exceed children enrolled.');
    }
    if (meals !== null && (Number.isNaN(meals) || meals < 0 || meals > 200)) {
      errors.push('Meals served count must be between 0 and 200.');
    }
    if (!mealServed && meals !== null && meals > 0) {
      errors.push('Contradiction: meal served is false but meal count is greater than zero.');
    }
    if (!confirmed) errors.push('You must confirm this synthetic report before submitting.');
    return errors;
  }

  function buildReport(): SandboxReport {
    const fields: Record<string, unknown> = {
      activity_type: [...activities],
      children_present: Number(childrenPresent),
      meal_served: mealServed,
      preschool_activity: preschoolActivity,
      photo_attached: photoAttached,
      remarks: remarks,
    };
    if (childrenEnrolled.trim() !== '') fields.children_enrolled = Number(childrenEnrolled);
    if (childrenAbsent.trim() !== '') fields.children_absent = Number(childrenAbsent);
    if (mealCount.trim() !== '') fields.meal_count = Number(mealCount);
    return {
      schema_version: 'sandbox-0.1',
      worker: { worker_code: workerCode.trim(), centre_code: centreCode.trim() },
      report_date: reportDate,
      fields,
      transcript_ref: 'manual-entry',
      confirmation: { confirmed_by: workerCode.trim(), confirmed_at: new Date().toISOString() },
      status: 'draft',
    };
  }

  async function handleSubmit() {
    const errs = validate();
    setValidationErrors(errs);
    setGatewayError(null);
    setGatewayResult(null);
    if (errs.length > 0) return;
    setLoading(true);
    try {
      const report = buildReport();
      const res = await api.submit(report, submitKey, 'manual-entry');
      setGatewayResult(res);
    } catch (err) {
      setGatewayError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setValidationErrors([]);
    setGatewayResult(null);
    setGatewayError(null);
    setConfirmed(false);
  }

  return (
    <div>
      <h1>Simulated Anganwadi Reporting App</h1>
      <p className="muted">
        A generic dummy reporting app for manual entry by a synthetic worker at a synthetic centre.
        This is <strong>not</strong> Poshan Tracker or Bala Sanjeevini, and these fields are not official
        reporting requirements.
      </p>
      <div className="notice">
        All values below are illustrative. No beneficiary records, no real credentials, no government
        connection. The photo option references a locally created synthetic placeholder only.
      </div>

      <section className="card">
        <h2>Worker and centre (synthetic)</h2>
        <div className="inline-fields">
          <div className="field">
            <label className="field-label" htmlFor="worker-code">Worker code</label>
            <input id="worker-code" value={workerCode} onChange={(e) => setWorkerCode(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="centre-code">Centre code</label>
            <input id="centre-code" value={centreCode} onChange={(e) => setCentreCode(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="field-label" htmlFor="report-date">Report date</label>
          <input id="report-date" type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
        </div>
      </section>

      <section className="card">
        <h2>Activity</h2>
        <p className="muted small">Select one or more illustrative activities.</p>
        {ACTIVITY_OPTIONS.map((opt) => (
          <label className="checkbox-row" key={opt}>
            <input
              type="checkbox"
              checked={activities.includes(opt)}
              onChange={() => toggleActivity(opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </section>

      <section className="card">
        <h2>Attendance and meal (synthetic numbers)</h2>
        <div className="inline-fields">
          <div className="field">
            <label className="field-label" htmlFor="children-enrolled">Children enrolled</label>
            <input id="children-enrolled" type="number" min={0} max={200} value={childrenEnrolled} onChange={(e) => setChildrenEnrolled(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="children-present">Children present</label>
            <input id="children-present" type="number" min={0} max={200} value={childrenPresent} onChange={(e) => setChildrenPresent(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="children-absent">Children absent</label>
            <input id="children-absent" type="number" min={0} max={200} value={childrenAbsent} onChange={(e) => setChildrenAbsent(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="meal-count">Meals served count</label>
            <input id="meal-count" type="number" min={0} max={200} value={mealCount} onChange={(e) => setMealCount(e.target.value)} />
          </div>
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={mealServed} onChange={(e) => setMealServed(e.target.checked)} />
          <span>Meal served today</span>
        </label>
      </section>

      <section className="card">
        <h2>Preschool details and photo</h2>
        <div className="field">
          <label className="field-label" htmlFor="preschool-activity">Preschool activity</label>
          <input id="preschool-activity" value={preschoolActivity} onChange={(e) => setPreschoolActivity(e.target.value)} placeholder="e.g. songs, stories" />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="remarks">Remarks</label>
          <textarea id="remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} />
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={photoAttached} onChange={(e) => setPhotoAttached(e.target.checked)} />
          <span>Attach synthetic sample image (<code>synthetic-sample.svg</code>) — never a child photo</span>
        </label>
        {photoAttached && (
          <img src="/synthetic-sample.svg" alt="Synthetic placeholder illustration, not a child photo" className="thumb" />
        )}
      </section>

      <section className="card">
        <h2>Validation and confirmation</h2>
        {validationErrors.length > 0 && (
          <div className="error">
            <strong>Fix these issues:</strong>
            <ul>{validationErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </div>
        )}
        <label className="checkbox-row">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          <span>I confirm this is a synthetic report for the simulated gateway submission.</span>
        </label>
        <p className="hint">Idempotency key: <code>{submitKey}</code></p>
        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting…' : 'Validate and submit via gateway'}
        </button>
      </section>

      <GatewayResult
        result={gatewayResult}
        loading={loading}
        error={gatewayError}
        onRetry={handleSubmit}
        onReset={handleReset}
        title="Submission status"
      />
    </div>
  );
}

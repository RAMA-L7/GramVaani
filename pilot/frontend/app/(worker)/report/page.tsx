'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { Extraction, PilotReport, Validation } from '@/lib/types';
import { coerceLike, displayValue, errorMessage, labelFor, newIdempotencyKey, stringifyValue, teLabelFor } from '@/lib/utils';
import { loadWorkflow, patchWorkflow } from '@/lib/workflow';

export default function ReportPage() {
  const router = useRouter();
  const [transcript, setTranscript] = useState('');
  const [original, setOriginal] = useState('');
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);
  const [ambiguities, setAmbiguities] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<PilotReport | null>(null);
  const [validation, setValidation] = useState<Validation | null>(null);
  const [confirmKey] = useState(() => newIdempotencyKey('confirm'));

  useEffect(() => {
    const wf = loadWorkflow();
    if (!wf.transcript && (wf.extractions || []).length === 0) {
      router.replace('/');
      return;
    }
    setTranscript(wf.transcript || '');
    setOriginal(wf.originalTranscript || '');
    setExtractions(wf.extractions || []);
    setGaps(wf.gaps || []);
    setAmbiguities(wf.ambiguities || []);
    setAnswers(wf.answers || {});
    setReport(wf.report || null);
    setValidation(wf.validation || null);
    const init: Record<string, string> = {};
    (wf.extractions || []).forEach((ex) => {
      const c = wf.corrections?.[ex.field_id];
      init[ex.field_id] = c != null ? stringifyValue(c) : stringifyValue(ex.value);
    });
    // include answered clarification values for display convenience
    Object.entries(wf.answers || {}).forEach(([k, v]) => { if (init[k] == null || init[k] === '') init[k] = stringifyValue(v); });
    setValues(init);
  }, [router]);

  const missing = useMemo(() => {
    const known = new Set([...Object.keys(values).filter(k => (values[k] ?? '').toString().trim() !== ''), ...Object.keys(answers || {})]);
    return (gaps || []).filter(g => !known.has(g));
  }, [gaps, values, answers]);
  const uncertain = ambiguities || [];

  function onValueChange(fieldId: string, value: string) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    const wf = loadWorkflow();
    patchWorkflow({ corrections: { ...(wf.corrections || {}), [fieldId]: value }, report: null, validation: null });
    setConfirmChecked(false);
  }

  async function onConfirm() {
    if (!confirmChecked) { setError('దయచేసి నిర్ధారించండి (టిక్ చేయండి). Please confirm before creating the sample report.'); return; }
    setBusy(true); setError(null);
    try {
      const wf = loadWorkflow();
      const corrections: Record<string, unknown> = {};
      extractions.forEach((ex) => {
        const edited = values[ex.field_id] ?? stringifyValue(ex.value);
        corrections[ex.field_id] = coerceLike(edited, ex.value);
      });
      // merge clarification answers into corrections/answers payload
      const mergedAnswers = { ...(wf.answers || {}), ...answers };
      const payload = {
        extractions: extractions.map((ex) => ({ ...ex, value: coerceLike(values[ex.field_id] ?? stringifyValue(ex.value), ex.value) })),
        answers: mergedAnswers,
        corrections,
        scenario_id: wf.scenarioId,
        idempotency_key: confirmKey,
        transcript,
        original_transcript: original,
        explicit_confirmation: true,
        sample_report: true,
      };
      const res = await api.confirm(payload);
      const rep = { ...res.report, sample: true, label: res.report.label || 'Experimental sample report (not official, not submitted)' } as PilotReport;
      setReport(rep);
      setValidation(res.validation);
      patchWorkflow({ report: rep, validation: res.validation, answers: mergedAnswers, corrections, transcript, originalTranscript: original });
      router.push('/done');
    } catch (e) {
      setError(`నమూనా నివేదిక తయారు కాలేదు. మళ్లీ ప్రయత్నించండి. (${errorMessage(e)})`);
    } finally {
      setBusy(false);
    }
  }

  const allFieldIds = Array.from(new Set([...extractions.map(e => e.field_id), ...gaps, ...ambiguities, ...Object.keys(answers || {})]));

  return (
    <div className="stack-lg">
      <section className="stack">
        <h1>నమూనా నివేదిక</h1>
        <p className="muted">దయచేసి వివరాలు సరిచూసి నిర్ధారించండి. ఇది ప్రయోగాత్మక నమూనా మాత్రమే, ప్రభుత్వానికి పంపబడదు.</p>
      </section>

      <div className="notice notice-warn">
        <strong>గమనిక / Note</strong>
        <div>ఇది అధికారిక నివేదిక కాదు. ఎక్కడికీ సమర్పించబడదు. (Experimental sample — not official, not submitted.)</div>
      </div>

      {(missing.length > 0 || uncertain.length > 0) && (
        <div className="notice notice-info" role="status">
          <strong>చూడవలసినవి</strong>
          {missing.length > 0 && <div>ఖాళీగా ఉన్నాయి: {missing.map((f) => teLabelFor(f) || labelFor(f)).join(', ')}</div>}
          {uncertain.length > 0 && <div>స్పష్టంగా లేదు: {uncertain.map((f) => teLabelFor(f) || labelFor(f)).join(', ')}</div>}
        </div>
      )}

      <section className="card stack">
        <h2>వివరాలు</h2>
        {allFieldIds.length === 0 && <p className="muted">వివరాలు లేవు. దయచేసి తిరిగి మాట్లాడండి లేదా సమాధానాలు ఇవ్వండి.</p>}
        <div className="field-list">
          {allFieldIds.map((fid) => {
            const val = values[fid] ?? stringifyValue(answers?.[fid]) ?? '';
            const isMissing = missing.includes(fid);
            const isUncertain = uncertain.includes(fid);
            return (
              <div className="field-item" key={fid}>
                <div className="field-head">
                  <div>
                    <div style={{ fontWeight: 700 }}>{teLabelFor(fid) || labelFor(fid)}</div>
                    <div className="small muted">{labelFor(fid)}</div>
                  </div>
                  {isMissing ? <span className="pill pill-warn">ఖాళీ</span> : isUncertain ? <span className="pill pill-info">సరిచూడండి</span> : <span className="pill pill-ok">ఉంది</span>}
                </div>
                <label className="visually-hidden" htmlFor={`f-${fid}`}>{teLabelFor(fid) || labelFor(fid)}</label>
                <input id={`f-${fid}`} type="text" value={val} onChange={(e) => onValueChange(fid, e.target.value)} placeholder="విలువ నమోదు చేయండి" />
              </div>
            );
          })}
        </div>
      </section>

      <details className="simple">
        <summary>మీ మాటలు చూడండి (Transcript)</summary>
        <div className="transcript-box" lang="te" style={{ marginTop: 10 }}>{transcript || '—'}</div>
      </details>

      {error && <div className="notice notice-error" role="alert"><strong>సమస్య</strong><div>{error}</div></div>}

      <section className="card stack">
        <label className="checkbox-row">
          <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} />
          <span><strong>నేను వివరాలు చూశాను.</strong> ఇవి సరైనవి అని నేను నిర్ధారిస్తున్నాను. ఇది నమూనా నివేదిక మాత్రమే. (I confirm this sample report.)</span>
        </label>
        <button type="button" className="btn btn-primary" onClick={onConfirm} disabled={busy}>
          {busy ? 'దయచేసి వేచి ఉండండి…' : 'నిర్ధారించి నమూనా నివేదిక తయారు చేయండి'}
        </button>
      </section>

      <div className="btn-row btn-row-inline">
        <Link href="/questions" className="btn btn-secondary">ప్రశ్నలకు తిరిగి వెళ్లండి</Link>
        <Link href="/review" className="btn btn-secondary">మాటలు సరిచేయండి</Link>
      </div>
    </div>
  );
}
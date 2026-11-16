'use client';

import { useEffect, useState } from 'react';
import ClarificationCard from '@/components/ClarificationCard';
import ExtractionReview from '@/components/ExtractionReview';
import ReportPreview from '@/components/ReportPreview';
import { api, fetchExportBlob } from '@/lib/api';
import type { ClarificationQuestion, Extraction, PilotReport, Validation } from '@/lib/types';
import { coerceByType, coerceLike, downloadJson, errorMessage, newIdempotencyKey, stringifyValue } from '@/lib/utils';
import { loadWorkflow, patchWorkflow } from '@/lib/workflow';
import Link from 'next/link';

export default function PreviewPage() {
  const [transcript, setTranscript] = useState('');
  const [original, setOriginal] = useState('');
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);
  const [ambiguities, setAmbiguities] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [report, setReport] = useState<PilotReport | null>(null);
  const [validation, setValidation] = useState<Validation | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [confirmKey] = useState(() => newIdempotencyKey('confirm'));
  const [draftId, setDraftId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const wf = loadWorkflow();
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
    setValues(init);
  }, []);

  function onCorrectionChange(fieldId: string, value: string) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    patchWorkflow({ report: null, validation: null, corrections: { ...(loadWorkflow().corrections || {}), [fieldId]: value } });
    setConfirmChecked(false);
  }

  async function loadClarifications() {
    setBusy('clarify'); setError(null); setMsg(null);
    try {
      const res = await api.clarify(gaps, answers, transcript, extractions);
      setQuestions(res.questions || []);
      setQIndex(0);
      setCurrentAnswer('');
      if ((res.questions || []).length === 0) setMsg('No clarification questions returned by backend. Review values and explicitly confirm to generate sample report.');
    } catch (err) {
      setError(`Could not load clarifications: ${errorMessage(err)}. స్పష్టత ప్రశ్నలు లోడ్ కాలేదు.`);
    } finally { setBusy(null); }
  }

  function submitAnswer() {
    const q = questions[qIndex];
    if (!q) return;
    const coerced = coerceByType(currentAnswer, q.type);
    const next = { ...answers, [q.field_id]: coerced };
    setAnswers(next);
    patchWorkflow({ answers: next, report: null, validation: null });
    setCurrentAnswer('');
    if (qIndex < questions.length - 1) setQIndex(qIndex + 1);
    else { setQIndex(questions.length); setMsg('Clarifications answered. You may still correct values before explicit confirmation.'); }
  }

  const clarificationsDone = questions.length === 0 || qIndex >= questions.length;

  async function handleConfirm() {
    if (!confirmChecked) { setError('Explicit worker confirmation is required before generating a sample report. ధృవీకరణ అవసరం.'); return; }
    setBusy('confirm'); setError(null); setMsg(null);
    try {
      const finalExtractions = extractions.map((ex) => ({
        ...ex,
        value: coerceLike(values[ex.field_id] ?? stringifyValue(ex.value), ex.value),
      }));
      const corrections: Record<string, unknown> = {};
      extractions.forEach((ex) => {
        const edited = values[ex.field_id] ?? stringifyValue(ex.value);
        if (edited !== stringifyValue(ex.value)) corrections[ex.field_id] = coerceLike(edited, ex.value);
      });
      const payload = {
        extractions: finalExtractions,
        answers,
        corrections,
        scenario_id: loadWorkflow().scenarioId,
        idempotency_key: confirmKey,
        transcript,
        original_transcript: original,
        explicit_confirmation: true,
        sample_report: true,
      };
      const res = await api.confirm(payload);
      const rep = { ...res.report, sample: true, label: res.report.label || 'Experimental sample report (not official, not submitted)' };
      setReport(rep);
      setValidation(res.validation);
      patchWorkflow({ report: rep, validation: res.validation, answers, corrections, transcript, originalTranscript: original });
      setMsg('Sample report generated after explicit confirmation. Review carefully; this is experimental and not submitted.');
    } catch (err) {
      setError(`Confirmation/report generation failed: ${errorMessage(err)}.`);
    } finally { setBusy(null); }
  }

  async function saveDraft() {
    setBusy('draft'); setError(null); setMsg(null);
    try {
      const wf = loadWorkflow();
      const draft = {
        id: draftId,
        transcript,
        original_transcript: original,
        report: report || undefined,
        extractions,
        answers,
        corrections: wf.corrections,
        metadata: { scenarioId: wf.scenarioId, saved_from: 'preview', sample: true },
      };
      const res = await api.saveDraft(draft);
      const id = res.id || (res as any).draft?.id;
      if (id) setDraftId(id);
      setMsg(`Draft saved${id ? ` (id: ${id})` : ''}. డ్రాఫ్ట్ సేవ్ అయింది.`);
    } catch (err) {
      setError(`Draft save failed: ${errorMessage(err)}. You can still export JSON locally.`);
    } finally { setBusy(null); }
  }

  async function exportJson() {
    setError(null); setMsg(null);
    const payload = report || { note: 'No confirmed sample report yet', transcript, original_transcript: original, extractions, answers, corrections: loadWorkflow().corrections, sample: true, experimental: true, not_official: true, not_submitted: true };
    try {
      const blob = await fetchExportBlob((payload as any));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `gramvaani-pilot-sample-report-${Date.now()}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000);
      setMsg('JSON export downloaded. If backend export is unavailable, local export is used.');
    } catch {
      downloadJson(`gramvaani-pilot-sample-report-${Date.now()}.json`, payload);
      setMsg('Exported JSON locally (backend export endpoint unavailable).');
    }
  }

  return (
    <div>
      <h1>Report preview / నమూనా నివేదిక</h1>
      <p className="muted">Grounded values, clarifications, corrections, explicit confirmation, sample report, draft saving and JSON export. Experimental only - not official and not submitted.</p>

      {extractions.length === 0 ? (
        <section className="card"><p>No extractions in workflow. <Link href="/transcript">Go to transcript</Link> to run extraction, or <Link href="/test-scenarios">load a synthetic scenario</Link>.</p></section>
      ) : (
        <>
          <ExtractionReview transcript={transcript} extractions={extractions} gaps={gaps} ambiguities={ambiguities} values={values} onChange={onCorrectionChange} />

          <section className="card">
            <h2>Clarifications for missing / ambiguous info</h2>
            <p className="muted small">Fetch clarification questions from backend based on gaps/ambiguities and provide answers. You can still correct values above.</p>
            <div className="btn-row">
              <button type="button" className="btn" onClick={loadClarifications} disabled={!!busy}>Load clarification questions</button>
              {questions.length > 0 && !clarificationsDone && <span className="hint">Answering {qIndex + 1}/{questions.length}</span>}
            </div>
            {questions.length === 0 && gaps.length === 0 && ambiguities.length === 0 && <p className="hint">No gaps/ambiguities flagged from extraction. Confirmation is still required.</p>}
          </section>

          {!clarificationsDone && questions[qIndex] && (
            <ClarificationCard question={questions[qIndex]} answer={currentAnswer} onAnswerChange={setCurrentAnswer} onSubmit={submitAnswer} index={qIndex} total={questions.length} loading={busy === 'clarify'} />
          )}
          {questions.length > 0 && clarificationsDone && <div className="success">All clarification questions answered.</div>}

          <section className="card">
            <h2>Explicit worker confirmation</h2>
            <div className="notice">
              No sample report should be treated as final without your explicit confirmation. Please review transcript, corrected values, source spans, and clarification answers.
            </div>
            <label className="checkbox-row">
              <input type="checkbox" checked={confirmChecked} onChange={(e) => setConfirmChecked(e.target.checked)} />
              <span><strong>I explicitly confirm</strong> that I reviewed the transcript and extracted/corrected values and want to generate an <strong>experimental sample report</strong> (not official, not submitted).</span>
            </label>
            <p className="hint">Confirm key: <code>{confirmKey}</code></p>
            <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={!!busy || !clarificationsDone}>
              {busy === 'confirm' ? 'Generating…' : 'Confirm and generate sample report'}
            </button>
            {!clarificationsDone && <p className="hint">Complete clarification questions before confirmation (if any are loaded).</p>}
          </section>

          {error && <div className="error">{error}</div>}
          {msg && <div className="success">{msg}</div>}

          {report && <ReportPreview report={report} validation={validation} />}

          <section className="card">
            <h2>Save draft and export</h2>
            <p className="muted small">Draft saving posts to backend. JSON export can use backend export or local fallback. Exported/report content is experimental sample data only.</p>
            <div className="btn-row">
              <button type="button" className="btn" onClick={saveDraft} disabled={!!busy}>{busy === 'draft' ? 'Saving…' : 'Save draft'}</button>
              <button type="button" className="btn" onClick={exportJson} disabled={!!busy}>Export JSON</button>
              <Link href="/transcript" className="btn">Back to transcript</Link>
            </div>
            {draftId && <p className="hint">Draft id: <code>{draftId}</code></p>}
          </section>
        </>
      )}
    </div>
  );
}

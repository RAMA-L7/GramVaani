'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, fetchExportBlob } from '@/lib/api';
import { displayValue, downloadJson, errorMessage, labelFor, teLabelFor } from '@/lib/utils';
import { loadWorkflow, patchWorkflow } from '@/lib/workflow';
import type { PilotReport, Validation } from '@/lib/types';
import { isConfirmedSampleReport } from '@/lib/confirmation';

export default function DonePage() {
  const router = useRouter();
  const [report, setReport] = useState<PilotReport | null>(null);
  const [validation, setValidation] = useState<Validation | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | undefined>();

  useEffect(() => {
    const wf = loadWorkflow();
    if (!wf.report) { router.replace('/report'); return; }
    setReport(wf.report);
    setValidation(wf.validation);
    if (wf.draftId) setDraftId(wf.draftId);
  }, [router]);

  const confirmed = isConfirmedSampleReport(report as any);

  async function saveDraft() {
    if (!report) return;
    setBusy('save'); setError(null); setMsg(null);
    try {
      const wf = loadWorkflow();
      const wasCompleted = isConfirmedSampleReport(report as any);
      const metaStatus = wasCompleted ? 'corrected' : undefined;
      const res = await api.saveDraft({
        draft_id: draftId || wf.draftId,
        transcript: wf.transcript,
        original_transcript: wf.originalTranscript,
        report,
        extractions: wf.extractions,
        answers: wf.answers,
        corrections: wf.corrections,
        meta: { sample: true, saved_from: 'worker_done', worker_code: wf.workerProfile?.worker_code, centre_code: wf.workerProfile?.centre_code, report_date: (report as any)?.report_date, status: metaStatus },
      });
      const id = (res as any).id || (res as any).draft_id || (res as any).draft?.id;
      if (id) {
        setDraftId(id);
        patchWorkflow({ draftId: id });
      }
      setMsg(
        wasCompleted
          ? 'సవరించిన డ్రాఫ్ట్ సేవ్ అయింది. (Corrected draft saved.)'
          : 'డ్రాఫ్ట్ సేవ్ అయింది (నిర్ధారించబడలేదు). (Draft saved — not confirmed.)'
      );
    } catch (e) {
      setError(`సేవ్ కాలేదు. (${errorMessage(e)})`);
    } finally { setBusy(null); }
  }

  async function exportJson() {
    if (!report) return;
    setBusy('export'); setError(null); setMsg(null);
    const payload = report;
    try {
      const blob = await fetchExportBlob(payload as any);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `gramvaani-sample-report-${Date.now()}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMsg(confirmed ? 'డౌన్‌లోడ్ అయింది. (Downloaded.)' : 'డ్రాఫ్ట్ డౌన్‌లోడ్ అయింది (నిర్ధారించబడలేదు). (Draft downloaded — not confirmed.)');
    } catch {
      downloadJson(`gramvaani-sample-report-${Date.now()}.json`, payload);
      setMsg(confirmed ? 'డౌన్‌లోడ్ అయింది (local).' : 'డ్రాఫ్ట్ డౌన్‌లోడ్ అయింది (local, నిర్ధారించబడలేదు).');
    } finally { setBusy(null); }
  }

  if (!report) return null;
  const entries = Object.entries(report.fields || {});

  return (
    <div className="stack-lg">
      <section className={`card stack center ${confirmed ? 'card-soft' : ''}`}>
        <div style={{ fontSize: '2.5rem' }} aria-hidden="true">{confirmed ? '✅' : '📝'}</div>
        <h1>{confirmed ? 'నమూనా నివేదిక సిద్ధం' : 'డ్రాఫ్ట్ (నిర్ధారించబడలేదు)'}</h1>
        <p>
          {confirmed
            ? 'మీరు నిర్ధారించిన నమూనా నివేదిక తయారైంది. ఇది అధికారికం కాదు, ఎక్కడికీ పంపబడలేదు.'
            : 'ఈ రికార్డు ఇంకా నిర్ధారించబడిన నమూనా నివేదిక కాదు. దయచేసి తిరిగి వెళ్లి వివరాలు సరిచేసి నిర్ధారించండి. (Draft only — not confirmed, not submitted.)'}
        </p>
      </section>

      <div className="notice notice-warn">
        <strong>ప్రయోగాత్మక నమూనా — సమర్పించబడలేదు / Not official, not submitted</strong>
        <div>Experimental sample/draft — not official, not submitted to any government system.</div>
      </div>

      {!confirmed && (
        <div className="notice notice-error" role="alert">
          <strong>నిర్ధారణ లేదు / Not confirmed</strong>
          <div>ఈ నివేదిక డ్రాఫ్ట్ స్థితిలో ఉంది (explicit confirmation లేదు లేదా validation పూర్తి కాలేదు). నిర్ధారించిన నమూనాగా చూపబడదు. Please return to the report, fix issues, and confirm again.</div>
        </div>
      )}

      {validation && !validation.valid && (
        <div className="notice notice-info">
          <strong>కొన్ని వివరాలు చూడండి / Validation issues</strong>
          <div>నమూనా నివేదికలో ఖాళీలు/గమనికలు ఉండవచ్చు. అవసరమైతే తిరిగి సరిచేయండి.</div>
          {Array.isArray(validation.errors) && validation.errors.length > 0 && (
            <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 18 }}>
              {validation.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      <section className="card stack">
        <h2>{confirmed ? 'నమూనా నివేదిక వివరాలు' : 'డ్రాఫ్ట్ వివరాలు (Draft details)'}</h2>
        <div className="field-list">
          {entries.map(([k, v]) => (
            <div className="field-item" key={k}>
              <div style={{ fontWeight: 700 }}>{teLabelFor(k) || labelFor(k)}</div>
              <div style={{ fontSize: '1.1rem', marginTop: 4 }}>{displayValue(v)}</div>
            </div>
          ))}
          {entries.length === 0 && <p className="muted">వివరాలు లేవు.</p>}
        </div>
      </section>

      <section className="stack">
        {msg && <div className="notice notice-ok">{msg}</div>}
        {error && <div className="notice notice-error">{error}</div>}
        <div className="btn-row btn-row-inline">
          <button type="button" className="btn btn-secondary" onClick={saveDraft} disabled={!!busy}>{busy === 'save' ? '…' : '💾 సేవ్ చేయండి'}</button>
          <button type="button" className="btn btn-secondary" onClick={exportJson} disabled={!!busy}>{busy === 'export' ? '…' : '⬇️ డౌన్‌లోడ్ (JSON)'}</button>
        </div>
        <Link href="/report" className="btn btn-secondary">నివేదిక సరిచేయండి</Link>
        <Link href="/" className="btn btn-primary" onClick={() => { /* keep report unless new started */ }}>మొదటి స్క్రీన్‌కు వెళ్లండి</Link>
      </section>
    </div>
  );
}
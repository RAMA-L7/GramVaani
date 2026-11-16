'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { DraftHistoryResponse, DraftSummary, LocalWorkerProfile } from '@/lib/types';
import { displayValue, errorMessage } from '@/lib/utils';
import { loadWorkerProfile, patchWorkflow, saveWorkerProfile } from '@/lib/workflow';

type ViewMode = 'day' | 'week' | 'month';

function fmtTs(ts?: string | null) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return ts;
    return d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch { return ts; }
}

function statusClass(label?: string) {
  if (!label) return 'pill';
  if (label.includes('Completed')) return 'pill pill-ok';
  if (label.includes('Corrected')) return 'pill pill-info';
  return 'pill pill-warn';
}

export default function HistoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DraftHistoryResponse | null>(null);
  const [view, setView] = useState<ViewMode>('day');
  const [profile, setProfile] = useState<LocalWorkerProfile>({ worker_code: 'SYN-PILOT-W001', centre_code: 'SYN-PILOT-C001' });
  const [profileSaved, setProfileSaved] = useState<string | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  async function load() {
    setLoading(true); setError(null);
    try {
      const data = await api.draftsHistory();
      setHistory(data);
    } catch (e) {
      try {
        const list = await api.listDrafts();
        const arr = Array.isArray(list) ? list : (list as any)?.drafts || [];
        setHistory({ records: arr, counts: { total: arr.length, completed_samples: 0, drafts: arr.length, pending: arr.length, corrected: 0 }, daily: [], weekly: [], monthly: [], note: 'Local pilot history (fallback). Sample/experimental records only, not official and not submitted.' });
      } catch {
        setError(errorMessage(e));
      }
    } finally { setLoading(false); }
  }

  useEffect(() => { setProfile(loadWorkerProfile()); void load(); }, []);

  const groups = useMemo(() => {
    if (!history) return [];
    if (view === 'week') return history.weekly || [];
    if (view === 'month') return history.monthly || [];
    return history.daily || [];
  }, [history, view]);

  function saveProfile() {
    const cleaned = {
      worker_code: (profile.worker_code || '').trim() || 'SYN-PILOT-W001',
      centre_code: (profile.centre_code || '').trim() || 'SYN-PILOT-C001',
    };
    setProfile(cleaned);
    saveWorkerProfile(cleaned);
    patchWorkflow({ workerProfile: cleaned });
    setProfileSaved('స్థానిక ప్రొఫైల్ సేవ్ అయింది. (Local profile saved.)');
    setTimeout(() => setProfileSaved(null), 2500);
  }

  async function openDraft(rec: DraftSummary) {
    const id = rec.draft_id || rec.id;
    if (!id) return;
    setOpeningId(id); setError(null);
    try {
      const draft = await api.getDraft(id) as any;
      const payload = (draft && draft.data) ? draft.data : draft;
      const report = payload?.report || null;
      const transcript = payload?.transcript || '';
      const original = payload?.original_transcript || transcript || '';
      const extractions = Array.isArray(payload?.extractions) ? payload.extractions : [];
      const answers = payload?.answers || {};
      const corrections = payload?.corrections || {};
      const validation = payload?.validation || null;
      const profileNow = loadWorkerProfile();
      patchWorkflow({
        transcript,
        originalTranscript: original,
        transcriptMeta: payload?.transcriptMeta,
        extractions,
        gaps: [],
        ambiguities: [],
        answers,
        corrections,
        report,
        validation,
        draftId: id,
        workerProfile: profileNow,
      });
      if (report) router.push('/report');
      else if (transcript) router.push('/review');
      else router.push('/speak');
    } catch (e) {
      setError(`డ్రాఫ్ట్ తెరవలేకపోయాము. (${errorMessage(e)})`);
    } finally { setOpeningId(null); }
  }

  const counts = history?.counts;

  return (
    <div className="stack-lg">
      <section className="stack">
        <h1>నా చరిత్ర (Reporting history)</h1>
        <p className="muted">స్థానిక పైలట్ చరిత్ర మాత్రమే. నమూనా/ప్రయోగాత్మక రికార్డులు — అధికారికం కాదు, ఏ ప్రభుత్వ వ్యవస్థకు సమర్పించబడలేదు.</p>
      </section>

      <div className="notice notice-warn" role="note">
        <strong>గమనిక / Note</strong>
        <div>ఇవి ఈ పరికరంలో స్థానికంగా సేవ్ చేసిన డ్రాఫ్ట్/నమూనా రికార్డులు. డ్రాఫ్ట్ సేవ్ చేయడం అంటే అధికారిక నివేదిక సమర్పణ కాదు. (Local pilot records only — not official, not submitted.)</div>
      </div>

      <section className="card stack">
        <h2>స్థానిక కార్మిక గుర్తింపు (Safe local profile)</h2>
        <p className="small muted">ఈ గుర్తింపు స్థానికంగా మాత్రమే ఉపయోగించబడుతుంది. నిజమైన వ్యక్తిగత/లాభార్థి వివరాలు నమోదు చేయవద్దు.</p>
        <div className="stack" style={{ gap: 8 }}>
          <label className="label" htmlFor="wcode">Worker code (స్థానిక)</label>
          <input id="wcode" value={profile.worker_code} onChange={(e) => setProfile({ ...profile, worker_code: e.target.value })} />
          <label className="label" htmlFor="ccode">Centre code (స్థానిక)</label>
          <input id="ccode" value={profile.centre_code} onChange={(e) => setProfile({ ...profile, centre_code: e.target.value })} />
          <div className="btn-row btn-row-inline">
            <button type="button" className="btn btn-secondary" onClick={saveProfile}>ప్రొఫైల్ సేవ్ చేయండి</button>
            {profileSaved && <span className="small" role="status">{profileSaved}</span>}
          </div>
        </div>
      </section>

      {counts && (
        <section className="card stack">
          <h2>సారాంశం (Counts)</h2>
          <div className="btn-row btn-row-inline" style={{ flexWrap: 'wrap' }}>
            <span className="pill">మొత్తం: {counts.total}</span>
            <span className="pill pill-ok">పూర్తి (sample): {counts.completed_samples}</span>
            <span className="pill pill-warn">డ్రాఫ్ట్/పెండింగ్: {counts.pending}</span>
            <span className="pill pill-info">సవరించినవి: {counts.corrected}</span>
          </div>
        </section>
      )}

      <section className="stack">
        <div className="btn-row btn-row-inline" role="tablist" aria-label="History view">
          <button type="button" className={`btn ${view==='day'?'btn-primary':'btn-secondary'}`} onClick={() => setView('day')}>రోజువారీ</button>
          <button type="button" className={`btn ${view==='week'?'btn-primary':'btn-secondary'}`} onClick={() => setView('week')}>వారం</button>
          <button type="button" className={`btn ${view==='month'?'btn-primary':'btn-secondary'}`} onClick={() => setView('month')}>నెల</button>
        </div>

        {loading && <div className="card">లోడ్ అవుతోంది…</div>}
        {error && <div className="notice notice-error" role="alert"><strong>లోపం</strong><div>{error}</div><button type="button" className="btn btn-secondary" onClick={load} style={{ marginTop: 8 }}>మళ్లీ ప్రయత్నించండి</button></div>}

        {!loading && !error && groups.length === 0 && (
          <div className="card stack">
            <p>ఇంకా రికార్డులు లేవు. మొదటి నివేదికను ప్రారంభించండి.</p>
            <button type="button" className="btn btn-primary" onClick={() => router.push('/speak')}>మాట్లాడటం ప్రారంభించండి</button>
          </div>
        )}

        {!loading && !error && groups.map((g, idx) => (
          <section className="card stack" key={(g.date || g.period || idx).toString()}>
            <div className="field-head">
              <div>
                <h2 style={{ margin: 0 }}>{view === 'day' ? (g.date === 'unknown' ? 'తేదీ తెలియదు' : g.date) : (g.period || '—')}</h2>
                <div className="small muted">{view === 'day' ? 'రోజువారీ' : view === 'week' ? 'వారం వారీ సారాంశం' : 'నెల వారీ సారాంశం'}</div>
              </div>
              <div className="small"><span className="pill">మొత్తం {g.total}</span> <span className="pill pill-ok">{g.completed}</span> <span className="pill pill-warn">{g.drafts}</span> <span className="pill pill-info">{g.corrected}</span></div>
            </div>

            {Array.isArray(g.items) && g.items.length > 0 ? (
              <div className="field-list">
                {g.items.map((it) => {
                  const id = it.draft_id || it.id || '';
                  return (
                    <div className="field-item" key={id}>
                      <div className="field-head">
                        <div>
                          <div style={{ fontWeight: 700 }}>{it.period_label || 'Daily report'} {it.report_date ? `• ${it.report_date}` : ''}</div>
                          <div className="small muted">నమోదు: {fmtTs(it.created_at)} · చివరి నవీకరణ: {fmtTs(it.updated_at)}</div>
                          {(it.worker_code || it.centre_code) && <div className="small muted">ప్రొఫైల్: {displayValue(it.worker_code)} / {displayValue(it.centre_code)}</div>}
                          <div className="small muted">ID: {id}</div>
                        </div>
                        <span className={statusClass(it.status_label)}>{it.status_label || it.status || 'Draft'}</span>
                      </div>
                      <div className="btn-row btn-row-inline" style={{ marginTop: 8 }}>
                        <button type="button" className="btn btn-primary" disabled={!!openingId} onClick={() => openDraft(it)}>
                          {openingId === id ? 'తెరుస్తోంది…' : 'తెరవండి / సవరించండి (Open/Edit)'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="muted small">{view === 'day' ? 'వివరాలు అందుబాటులో లేవు.' : 'ఈ కాలానికి సారాంశం మాత్రమే.'}</p>
            )}
          </section>
        ))}

        {!loading && !error && view !== 'day' && history && history.records.length > 0 && (
          <section className="card stack">
            <h2>అన్ని రికార్డులు (All records)</h2>
            <div className="field-list">
              {history.records.map((it) => {
                const id = it.draft_id || it.id || '';
                return (
                  <div className="field-item" key={id}>
                    <div className="field-head">
                      <div>
                        <div style={{ fontWeight: 700 }}>{it.date_key || '—'} · {it.period_label || 'Daily report'}</div>
                        <div className="small muted">నమోదు: {fmtTs(it.created_at)} · నవీకరణ: {fmtTs(it.updated_at)}</div>
                      </div>
                      <span className={statusClass(it.status_label)}>{it.status_label || it.status || 'Draft'}</span>
                    </div>
                    <div className="btn-row btn-row-inline" style={{ marginTop: 8 }}>
                      <button type="button" className="btn btn-primary" disabled={!!openingId} onClick={() => openDraft(it)}>{openingId===id?'…':'తెరవండి / సవరించండి'}</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </section>
    </div>
  );
}

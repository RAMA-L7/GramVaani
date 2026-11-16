'use client';

import { useEffect, useMemo, useState } from 'react';
import ExtractionReview from '@/components/ExtractionReview';
import { api } from '@/lib/api';
import type { Extraction } from '@/lib/types';
import { coerceLike, errorMessage, stringifyValue } from '@/lib/utils';
import { loadWorkflow, patchWorkflow } from '@/lib/workflow';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TranscriptPage() {
  const router = useRouter();
  const [transcript, setTranscript] = useState('');
  const [original, setOriginal] = useState('');
  const [meta, setMeta] = useState<Record<string, unknown> | undefined>(undefined);
  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);
  const [ambiguities, setAmbiguities] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const wf = loadWorkflow();
    setTranscript(wf.transcript || '');
    setOriginal(wf.originalTranscript || '');
    setMeta(wf.transcriptMeta);
    setExtractions(wf.extractions || []);
    setGaps(wf.gaps || []);
    setAmbiguities(wf.ambiguities || []);
    const init: Record<string, string> = {};
    (wf.extractions || []).forEach((ex) => { init[ex.field_id] = wf.corrections?.[ex.field_id] != null ? stringifyValue(wf.corrections[ex.field_id]) : stringifyValue(ex.value); });
    setValues(init);
  }, []);

  function saveTranscriptState(nextTranscript = transcript) {
    const wf = loadWorkflow();
    patchWorkflow({ transcript: nextTranscript, originalTranscript: original || wf.originalTranscript || nextTranscript });
  }

  async function runExtraction() {
    if (!transcript.trim()) { setError('Transcript is empty. Please record or enter text. ట్రాన్స్క్రిప్ట్ ఖాళీగా ఉంది.'); return; }
    setBusy(true); setError(null); setMsg(null);
    try {
      const wf = loadWorkflow();
      saveTranscriptState(transcript);
      const res = await api.extract(transcript, wf.scenarioId);
      const exs = res.extractions || [];
      setExtractions(exs);
      setGaps(res.gaps || []);
      setAmbiguities(res.ambiguities || []);
      const init: Record<string, string> = {};
      exs.forEach((ex) => { init[ex.field_id] = stringifyValue(ex.value); });
      setValues(init);
      patchWorkflow({
        transcript,
        originalTranscript: original || wf.originalTranscript || transcript,
        extractions: exs,
        gaps: res.gaps || [],
        ambiguities: res.ambiguities || [],
        corrections: {},
        answers: {},
        report: null,
        validation: null,
      });
      setMsg('Extraction completed. Review grounded values and source spans below, correct if needed, then continue to report preview for clarifications and explicit confirmation.');
    } catch (err) {
      setError(`Extraction failed: ${errorMessage(err)}. విలువల వెలికితీత విఫలమైంది.`);
    } finally {
      setBusy(false);
    }
  }

  function onCorrectionChange(fieldId: string, value: string) {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
    const wf = loadWorkflow();
    const corrections = { ...(wf.corrections || {}), [fieldId]: value };
    patchWorkflow({ corrections, report: null, validation: null });
  }

  function continueToPreview() {
    saveTranscriptState(transcript);
    // persist correction coercion hint by storing string corrections
    const wf = loadWorkflow();
    const corr: Record<string, unknown> = { ...(wf.corrections || {}) };
    extractions.forEach((ex) => {
      const v = values[ex.field_id] ?? stringifyValue(ex.value);
      corr[ex.field_id] = coerceLike(v, ex.value);
    });
    patchWorkflow({ corrections: corr, transcript, originalTranscript: original || transcript });
    router.push('/preview');
  }

  const provider = (meta as any)?.provider;
  const simulated = (meta as any)?.simulated;

  return (
    <div>
      <h1>Transcript workspace / ట్రాన్స్క్రిప్ట్</h1>
      <p className="muted">Recognised Telugu and mixed Telugu-English text. You can fully edit it, preserve English terms/Telugu script, correct words, and re-run extraction. Original transcript is kept for reference.</p>

      <section className="card">
        <h2>Current transcript (editable)</h2>
        {provider && <p className="hint">Provider: <code>{String(provider)}</code>{simulated ? ' · backend flagged simulated/test mode' : ''}</p>}
        <div className="field">
          <label className="field-label" htmlFor="transcript">Transcript text</label>
          <textarea id="transcript" lang="te" value={transcript} onChange={(e) => { setTranscript(e.target.value); patchWorkflow({ transcript: e.target.value, report: null, validation: null }); }} placeholder="Transcript will appear here after voice recognition, or you can type/paste synthetic test text." />
        </div>
        <p className="hint">{transcript.trim().length} characters. Edits are not silently changed except by you.</p>
        <div className="btn-row">
          <button type="button" className="btn" onClick={() => { saveTranscriptState(); setMsg('Transcript saved locally.'); }}>Save transcript</button>
          <Link href="/voice" className="btn">Record again / మళ్లీ రికార్డ్</Link>
          <button type="button" className="btn btn-primary" onClick={runExtraction} disabled={busy}>{busy ? 'Extracting…' : 'Run / re-run extraction'}</button>
        </div>
        {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}
        {msg && <div className="success" style={{ marginTop: 10 }}>{msg}</div>}
      </section>

      <section className="card">
        <h2>Original transcript (reference)</h2>
        <p className="muted small">Kept visible so you can compare with your edits. Not overwritten by manual edits.</p>
        {original ? <div className="span-box transcript-box" lang="te">{original}</div> : <p className="hint">No original transcript stored yet.</p>}
        {original && transcript !== original && <button type="button" className="btn btn-small" onClick={() => { if (confirm('Replace edited transcript with original?')) { setTranscript(original); patchWorkflow({ transcript: original, report: null, validation: null }); } }}>Restore original into editor</button>}
      </section>

      <ExtractionReview transcript={transcript} extractions={extractions} gaps={gaps} ambiguities={ambiguities} values={values} onChange={onCorrectionChange} />

      <section className="card">
        <h2>Next</h2>
        <p className="muted small">Continue to clarify missing/ambiguous fields and explicitly confirm before generating a sample report.</p>
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={continueToPreview} disabled={extractions.length === 0}>Continue to report preview / clarification</button>
          <Link href="/test-scenarios" className="btn">Load synthetic test scenario</Link>
        </div>
        {extractions.length === 0 && <p className="hint">Run extraction first to enable report preview flow.</p>}
      </section>
    </div>
  );
}

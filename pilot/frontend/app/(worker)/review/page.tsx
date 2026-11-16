'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { coerceLike, errorMessage, stringifyValue } from '@/lib/utils';
import { loadWorkflow, patchWorkflow } from '@/lib/workflow';

export default function ReviewPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [original, setOriginal] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wf = loadWorkflow();
    setText(wf.transcript || '');
    setOriginal(wf.originalTranscript || '');
  }, []);

  async function onContinue() {
    const transcript = text.trim();
    if (!transcript) {
      setError('మాటలు లేవు. దయచేసి మాట్లాడండి లేదా టైప్ చేయండి. (No text to continue.)');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const wf = loadWorkflow();
      patchWorkflow({ transcript, originalTranscript: original || wf.originalTranscript || transcript });
      const res = await api.extract(transcript, wf.scenarioId);
      const exs = res.extractions || [];
      const corrections: Record<string, unknown> = {};
      exs.forEach((ex) => { corrections[ex.field_id] = coerceLike(stringifyValue(ex.value), ex.value); });
      patchWorkflow({
        transcript,
        originalTranscript: original || transcript,
        extractions: exs,
        gaps: res.gaps || [],
        ambiguities: res.ambiguities || [],
        corrections,
        answers: {},
        report: null,
        validation: null,
      });
      router.push('/questions');
    } catch (err) {
      setError(`ముందుకు వెళ్లలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి. (${errorMessage(err)})`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack-lg">
      <section className="stack">
        <h1>మాటలను సరిచూడండి</h1>
        <p className="muted">కింద వచ్చిన మాటలు సరిగ్గా ఉన్నాయా చూడండి. తప్పు ఉంటే మార్చండి.</p>
      </section>

      <section className="card stack">
        <label className="label" htmlFor="transcript">మీ మాటలు (Telugu / English)</label>
        <textarea
          id="transcript"
          lang="te"
          value={text}
          onChange={(e) => { setText(e.target.value); patchWorkflow({ transcript: e.target.value, report: null, validation: null }); }}
          placeholder="ఇక్కడ మీ మాటలు కనిపిస్తాయి. అవసరమైతే టైప్ చేయండి."
        />
        <p className="small muted">మీరు మార్చిన మాటలనే మేము ఉపయోగిస్తాము. (Your edits will be used.)</p>
      </section>

      {original && original !== text && (
        <details className="simple">
          <summary>మొదటి మాటలు చూడండి (Original)</summary>
          <div className="transcript-box" lang="te" style={{ marginTop: 10 }}>{original}</div>
          <button type="button" className="btn btn-secondary" style={{ marginTop: 10 }} onClick={() => setText(original)}>మొదటి మాటలు తిరిగి పెట్టండి</button>
        </details>
      )}

      {error && <div className="notice notice-error" role="alert"><strong>సమస్య</strong><div>{error}</div></div>}

      <section className="stack">
        <button type="button" className="btn btn-primary" onClick={onContinue} disabled={busy}>
          {busy ? 'దయచేసి వేచి ఉండండి…' : 'సరే, ముందుకు వెళ్లండి'}
        </button>
        <div className="btn-row btn-row-inline">
          <Link href="/speak" className="btn btn-secondary">🎤 మళ్లీ మాట్లాడండి</Link>
          <Link href="/" className="btn btn-secondary">🏠 మొదటి స్క్రీన్</Link>
        </div>
      </section>
    </div>
  );
}
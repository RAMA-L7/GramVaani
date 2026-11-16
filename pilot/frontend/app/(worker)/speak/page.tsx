'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import SimpleRecorder from '@/components/worker/SimpleRecorder';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/utils';
import { loadWorkflow, patchWorkflow } from '@/lib/workflow';

export default function SpeakPage() {
  const router = useRouter();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioMs, setAudioMs] = useState(0);
  const [browserText, setBrowserText] = useState('');
  const [interim, setInterim] = useState('');
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [defaultProvider, setDefaultProvider] = useState<string | null>(null);
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    api.capabilities().then((caps) => {
      if (!active) return;
      setProviders(caps.providers || []);
      const best = (caps.providers || []).find((p: any) => p.available !== false && p.configured !== false && p.id !== 'browser' && p.id !== 'manual');
      setDefaultProvider(best?.id || null);
    }).catch(() => { /* worker flow can still use browser speech */ });
    return () => { active = false; };
  }, []);

  const capturedText = useMemo(() => [browserText, interim].filter(Boolean).join(' ').trim(), [browserText, interim]);

  async function continueToReview() {
    setError(null);
    setStatusMsg(null);
    const wf = loadWorkflow();

    // Prefer captured browser transcript if present (real-time, no credentials)
    if (capturedText) {
      setBusy(true);
      try {
        // submit to backend as transcript record for consistency (real path)
        const res = await api.transcribe({ provider: 'browser', text: capturedText, language: 'te-IN' });
        const transcript = (res.transcript || capturedText).toString();
        patchWorkflow({
          provider: res.provider || 'browser_web_speech',
          language: res.language || 'te-IN',
          transcript,
          originalTranscript: wf.originalTranscript || transcript,
          transcriptMeta: res as any,
        });
      } catch {
        // fallback: keep local browser transcript (still real STT, just not recorded by backend)
        patchWorkflow({
          provider: 'browser_web_speech',
          language: 'te-IN',
          transcript: capturedText,
          originalTranscript: wf.originalTranscript || capturedText,
          transcriptMeta: { provider: 'browser_web_speech', simulated: false, source: 'browser_local' } as any,
        });
      } finally { setBusy(false); }
      router.push('/review');
      return;
    }

    // No live transcript: try backend transcription of recorded audio if possible
    if (!audioBlob) {
      setError('ముందుగా రికార్డ్ చేయండి లేదా మాట్లాడండి. (Please record or speak first.)');
      return;
    }
    const candidate = defaultProvider || (providers.find((p) => p.available !== false && p.configured !== false && p.id !== 'browser' && p.id !== 'manual')?.id);
    if (!candidate) {
      // audio exists but no server STT configured and no browser transcript
      patchWorkflow({
        provider: 'recorded_audio',
        language: 'te-IN',
        transcript: wf.transcript || '',
        originalTranscript: wf.originalTranscript || '',
        transcriptMeta: { provider: 'recorded_audio', simulated: false, note: 'audio_recorded_no_transcript' } as any,
      });
      setStatusMsg('ఆడియో సేవ్ అయింది. మాటలు ఆటోమేటిక్‌గా రాలేదు - దయచేసి తదుపరి స్క్రీన్‌లో టైప్ చేయండి లేదా మళ్లీ చెప్పండి. (Audio saved; please type or speak again on next screen.)');
      router.push('/review');
      return;
    }

    setBusy(true);
    try {
      const res = await api.transcribe({
        provider: candidate,
        audioBlob,
        filename: `recording.${(audioBlob.type.split('/')[1] || 'webm').split(';')[0]}`,
        language: 'te-IN',
      });
      const transcript = (res.transcript || '').toString();
      if (!transcript.trim()) {
        setError('మాటలు గుర్తించలేకపోయాము. దయచేసి మళ్లీ స్పష్టంగా మాట్లాడండి లేదా తరువాత టైప్ చేయండి. (Could not recognize speech clearly.)');
        patchWorkflow({ provider: candidate, transcriptMeta: res as any });
        return;
      }
      patchWorkflow({
        provider: res.provider || candidate,
        language: res.language || 'te-IN',
        transcript,
        originalTranscript: wf.originalTranscript || transcript,
        transcriptMeta: res as any,
      });
      router.push('/review');
    } catch (err) {
      setError(`మాటలు మార్చడం సాధ్యం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి. (${errorMessage(err)})`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack-lg">
      <section className="stack">
        <h1>మీ మాటలు చెప్పండి</h1>
        <p className="muted">పెద్ద బటన్ నొక్కి మాట్లాడండి. పూర్తయిన తర్వాత "ముగించు" నొక్కండి.</p>
      </section>

      <SimpleRecorder
        language="te-IN"
        onRecorded={(blob, ms) => { setAudioBlob(blob); setAudioMs(ms); setError(null); }}
        onTranscript={(finalText, interimText) => { setBrowserText(finalText); setInterim(interimText); }}
      />

      {statusMsg && <div className="notice notice-info">{statusMsg}</div>}
      {error && <div className="notice notice-error" role="alert"><strong>గమనించండి</strong><div>{error}</div></div>}

      <section className="card stack">
        <button type="button" className="btn btn-primary" onClick={continueToReview} disabled={busy}>
          {busy ? 'దయచేసి వేచి ఉండండి…' : 'తర్వాతి దశకు వెళ్లండి (Review)'}
        </button>
        <p className="small muted center">మీ రికార్డింగ్/మాటలు తదుపరి స్క్రీన్‌లో చూపిస్తాము. అక్కడ మీరు సరిచేయవచ్చు.</p>
      </section>
    </div>
  );
}
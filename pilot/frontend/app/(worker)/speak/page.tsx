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
  const [recStatus, setRecStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);

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

  function invalidateForNewRecording(nextSessionId: string) {
    // New distinct recording/session: clear previous audio/transcript and invalidate stale derived state.
    setAudioBlob(null);
    setAudioMs(0);
    setBrowserText('');
    setInterim('');
    setStatusMsg(null);
    setError(null);
    setSessionId(nextSessionId);
    patchWorkflow({
      recordingSessionId: nextSessionId,
      transcript: '',
      originalTranscript: '',
      transcriptMeta: undefined,
      extractions: [],
      gaps: [],
      ambiguities: [],
      answers: {},
      corrections: {},
      report: null,
      validation: null,
      draftId: undefined,
      provider: undefined,
    });
  }

  async function continueToReview() {
    setError(null);
    setStatusMsg(null);
    if (recStatus === 'recording' || recStatus === 'paused') {
      setError('రికార్డింగ్ ఇంకా జరుగుతోంది. దయచేసి ఆపి, పూర్తయిన తర్వాత కొనసాగండి. (Please stop recording before continuing.)');
      return;
    }
    const wf = loadWorkflow();

    // Prefer captured browser transcript if present (real-time, no credentials)
    if (capturedText) {
      setBusy(true);
      try {
        // submit to backend as transcript record for consistency (real path)
        const res = await api.transcribe({ provider: 'browser', text: capturedText, language: 'te-IN' });
        const transcript = (res.transcript || capturedText).toString();
        patchWorkflow({
          recordingSessionId: sessionId || wf.recordingSessionId,
          provider: res.provider || 'browser_web_speech',
          language: res.language || 'te-IN',
          transcript,
          originalTranscript: transcript,
          transcriptMeta: res as any,
          extractions: [],
          gaps: [],
          ambiguities: [],
          answers: {},
          corrections: {},
          report: null,
          validation: null,
        });
      } catch {
        // fallback: keep local browser transcript (still real STT, just not recorded by backend)
        patchWorkflow({
          recordingSessionId: sessionId || wf.recordingSessionId,
          provider: 'browser_web_speech',
          language: 'te-IN',
          transcript: capturedText,
          originalTranscript: capturedText,
          transcriptMeta: { provider: 'browser_web_speech', simulated: false, source: 'browser_local' } as any,
          extractions: [],
          gaps: [],
          ambiguities: [],
          answers: {},
          corrections: {},
          report: null,
          validation: null,
        });
      } finally { setBusy(false); }
      router.push('/review');
      return;
    }

    // No live transcript: try backend transcription of recorded audio if possible
    if (!audioBlob) {
      setError('దయచేసి మొదట రికార్డ్ చేయండి లేదా మాట్లాడండి. (Please record or speak first.)');
      return;
    }
    const candidate = defaultProvider || (providers.find((p) => p.available !== false && p.configured !== false && p.id !== 'browser' && p.id !== 'manual')?.id);
    if (!candidate) {
      // audio exists but no server STT configured and no browser transcript
      patchWorkflow({
        recordingSessionId: sessionId || wf.recordingSessionId,
        provider: 'recorded_audio',
        language: 'te-IN',
        transcript: '',
        originalTranscript: '',
        transcriptMeta: { provider: 'recorded_audio', simulated: false, note: 'audio_recorded_no_transcript' } as any,
        extractions: [],
        gaps: [],
        ambiguities: [],
        answers: {},
        corrections: {},
        report: null,
        validation: null,
      });
      setStatusMsg('ఆడియో సేవ్ అయింది. ట్రాన్స్క్రిప్ట్ ఆటోమేటిక్‌గా రాలేదు - దయచేసి తర్వాత స్క్రీన్‌లో టైప్ చేయండి లేదా మళ్లీ మాట్లాడండి. (Audio saved; please type or speak again on next screen.)');
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
        setError('మాటలను గుర్తించలేకపోయాము. దయచేసి మళ్లీ స్పష్టంగా మాట్లాడండి లేదా వేరేలా టైప్ చేయండి. (Could not recognize speech clearly.)');
        patchWorkflow({
          recordingSessionId: sessionId || wf.recordingSessionId,
          provider: candidate,
          transcriptMeta: res as any,
          transcript: '',
          originalTranscript: '',
          extractions: [], gaps: [], ambiguities: [], answers: {}, corrections: {}, report: null, validation: null,
        });
        return;
      }
      patchWorkflow({
        recordingSessionId: sessionId || wf.recordingSessionId,
        provider: res.provider || candidate,
        language: res.language || 'te-IN',
        transcript,
        originalTranscript: transcript,
        transcriptMeta: res as any,
        extractions: [],
        gaps: [],
        ambiguities: [],
        answers: {},
        corrections: {},
        report: null,
        validation: null,
      });
      router.push('/review');
    } catch (err) {
      setError(`మాటలను గుర్తించే సమయంలో లోపం జరిగింది. దయచేసి మళ్లీ ప్రయత్నించండి. (${errorMessage(err)})`);
    } finally {
      setBusy(false);
    }
  }

  const canContinue = !busy && recStatus !== 'recording' && recStatus !== 'paused';

  return (
    <div className="stack-lg">
      <section className="stack">
        <h1>మీ మాటలు చెప్పండి</h1>
        <p className="muted">పెద్ద మీక్ బటన్ నొక్కి మాట్లాడండి. పూర్తి అయిన తర్వాత "ఆపండి" నొక్కండి.</p>
      </section>

      <SimpleRecorder
        language="te-IN"
        onRecordingStart={invalidateForNewRecording}
        onStatusChange={setRecStatus}
        onRecorded={(blob, ms) => { setAudioBlob(blob); setAudioMs(ms); setError(null); }}
        onTranscript={(finalText, interimText) => { setBrowserText(finalText); setInterim(interimText); }}
      />

      {statusMsg && <div className="notice notice-info">{statusMsg}</div>}
      {error && <div className="notice notice-error" role="alert"><strong>సమస్య వచ్చింది</strong><div>{error}</div></div>}

      <section className="card stack">
        <button type="button" className="btn btn-primary" onClick={continueToReview} disabled={!canContinue}>
          {busy ? 'దయచేసి వేచి ఉండండి…' : 'తర్వాతి దశకు వెళ్లండి (Review)'}
        </button>
        <p className="small muted center">
          {recStatus === 'recording' || recStatus === 'paused'
            ? 'రికార్డింగ్/మాటలను పూర్తిచేసి ఆపిన తర్వాత మాత్రమే కొనసాగండి.'
            : 'మీ రికార్డింగ్/మాటలను తర్వాత స్క్రీన్‌లో చూడవచ్చు. అక్కడ మీరు సవరించవచ్చు.'}
        </p>
      </section>
    </div>
  );
}

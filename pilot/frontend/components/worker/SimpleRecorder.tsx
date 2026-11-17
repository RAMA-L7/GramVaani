'use client';

import { useEffect, useRef, useState } from 'react';
import { detectBrowserSpeechRecognition, formatDuration } from '@/lib/utils';

interface Props {
  onRecorded: (blob: Blob, durationMs: number, url: string) => void;
  onTranscript?: (finalText: string, interim: string) => void;
  onRecordingStart?: (sessionId: string) => void;
  onStatusChange?: (status: 'idle' | 'recording' | 'paused' | 'stopped') => void;
  language?: string;
}

export default function SimpleRecorder({ onRecorded, onTranscript, onRecordingStart, onStatusChange, language = 'te-IN' }: Props) {
  const [supported, setSupported] = useState<{ recorder: boolean; speech: boolean }>({ recorder: false, speech: false });
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [interim, setInterim] = useState('');
  const [finalStt, setFinalStt] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTsRef = useRef<number>(0);
  const accMsRef = useRef<number>(0);
  const recognitionRef = useRef<any>(null);
  const finalRef = useRef('');

  useEffect(() => {
    const recorder = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';
    const speech = detectBrowserSpeechRecognition();
    setSupported({ recorder, speech });
    return () => {
      stopTimer();
      stopTracks();
      try { recognitionRef.current?.stop?.(); } catch {}
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopTimer() { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } }
  function startTimer() {
    stopTimer();
    startTsRef.current = Date.now();
    timerRef.current = setInterval(() => setElapsedMs(accMsRef.current + (Date.now() - startTsRef.current)), 200);
  }
  function stopTracks() { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; }

  function initSpeechRecognition() {
    if (typeof window === 'undefined') return null;
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = language || 'te-IN';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event: any) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const txt = res[0]?.transcript || '';
        if (res.isFinal) finalRef.current = `${finalRef.current} ${txt}`.trim();
        else interimText += txt;
      }
      setInterim(interimText);
      setFinalStt(finalRef.current);
      onTranscript?.(finalRef.current, interimText);
    };
    rec.onerror = (e: any) => {
      // non-fatal for recording; show gentle message
      if (e?.error === 'not-allowed' || e?.error === 'service-not-allowed') {
        setError('మైక్రోఫోన్ అనుమతి ఇవ్వలేదు. దయచేసి అనుమతి ఇచ్చి మళ్లీ ప్రయత్నించండి. (Microphone permission needed)');
      }
    };
    rec.onend = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { rec.start(); } catch {}
      }
    };
    return rec;
  }

  async function startRecording() {
    setError(null);
    if (!supported.recorder) {
      setError('ఈ బ్రౌజర్‌లో రికార్డింగ్ పనిచేయదు. Chrome లేదా Edge ఉపయోగించండి. (Recording not supported in this browser.)');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const preferred = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
      const chosen = preferred.find((t) => MediaRecorder.isTypeSupported(t)) || '';
      const mr = chosen ? new MediaRecorder(stream, { mimeType: chosen }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        stopTimer();
        const finalMs = accMsRef.current;
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        chunksRef.current = [];
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setElapsedMs(finalMs);
        setStatus('stopped');
        onStatusChange?.('stopped');
        stopTracks();
        try { recognitionRef.current?.stop?.(); } catch {}
        onRecorded(blob, finalMs, url);
      };
      mr.onerror = () => {
        setError('రికార్డింగ్ ఆగిపోయింది. దయచేసి మళ్లీ ప్రయత్నించండి. (Recording failed, please try again.)');
        setStatus('idle'); onStatusChange?.('idle'); stopTimer(); stopTracks();
      };
      accMsRef.current = 0; setElapsedMs(0); setInterim(''); setFinalStt(''); finalRef.current = '';
      // New recording/session: clear previous parent transcript/audio and start a distinct session.
      if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }
      setAudioBlob(null);
      const sessionId = `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      onTranscript?.('', '');
      onRecordingStart?.(sessionId);
      mr.start(250);
      setStatus('recording');
      onStatusChange?.('recording');
      startTimer();
      if (supported.speech) {
        const rec = initSpeechRecognition();
        recognitionRef.current = rec;
        try { rec?.start?.(); } catch {}
      }
    } catch (e: any) {
      const name = e?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('మైక్రోఫోన్ అనుమతి ఇవ్వలేదు. బ్రౌజర్ సెట్టింగ్స్‌లో అనుమతి ఇచ్చి మళ్లీ ప్రయత్నించండి. (Microphone permission denied.)');
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setError('మైక్రోఫోన్ కనబడలేదు. మైక్ కనెక్ట్ చేసి మళ్లీ ప్రయత్నించండి. (No microphone found.)');
      } else {
        setError('రికార్డింగ్ ప్రారంభించలేకపోయాము. దయచేసి మళ్లీ ప్రయత్నించండి. (Could not start recording.)');
      }
      setStatus('idle');
      stopTracks();
    }
  }

  function pauseRecording() {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state !== 'recording') return;
    try {
      mr.pause();
      accMsRef.current += Date.now() - startTsRef.current;
      stopTimer(); setElapsedMs(accMsRef.current); setStatus('paused'); onStatusChange?.('paused');
      try { recognitionRef.current?.stop?.(); } catch {}
    } catch { setError('ఈ బ్రౌజర్‌లో పాజ్ చేయలేము. (Pause not supported.)'); }
  }
  function resumeRecording() {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state !== 'paused') return;
    try {
      mr.resume(); setStatus('recording'); onStatusChange?.('recording'); startTimer();
      if (supported.speech) { try { recognitionRef.current?.start?.(); } catch {} }
    } catch { setError('మళ్లీ ప్రారంభించలేకపోయాము. (Could not resume.)'); }
  }
  function stopRecording() {
    const mr = mediaRecorderRef.current;
    if (!mr || (mr.state !== 'recording' && mr.state !== 'paused')) return;
    try {
      if (mr.state === 'recording') accMsRef.current += Date.now() - startTsRef.current;
      mr.stop();
    } catch { setError('ఆపలేకపోయాము. మళ్లీ ప్రయత్నించండి. (Could not stop.)'); }
  }

  const statusLabel = status === 'recording' ? 'వింటున్నాను / Listening' : status === 'paused' ? 'ఆపి ఉంచారు / Paused' : status === 'stopped' ? 'రికార్డింగ్ అయింది / Recorded' : 'సిద్ధం / Ready';
  const statusClass = status === 'recording' ? 'status-recording' : status === 'paused' ? 'status-paused' : status === 'stopped' ? 'status-stopped' : 'status-idle';

  return (
    <section className="stack" aria-label="Recorder">
      {error && <div className="notice notice-error" role="alert"><strong>సమస్య</strong><div>{error}</div></div>}
      {!supported.recorder && !error && (
        <div className="notice notice-error" role="alert"><strong>రికార్డింగ్ అందుబాటులో లేదు</strong><div>ఈ బ్రౌజర్‌లో మైక్రోఫోన్ రికార్డింగ్ పనిచేయదు. Chrome/Edge ప్రయత్నించండి.</div></div>
      )}

      <div className="card stack center">
        <div className={`status-chip ${statusClass}`} aria-live="polite"><span className="dot" aria-hidden="true" /> {statusLabel}</div>
        <div className="timer" aria-live="polite">{formatDuration(elapsedMs)}</div>
        <p className="muted small">{status === 'recording' ? 'ఇప్పుడు మీ వివరాలు చెప్పండి' : status === 'paused' ? 'కొనసాగించడానికి "కొనసాగించు" నొక్కండి' : status === 'stopped' ? 'వినండి లేదా మళ్లీ రికార్డ్ చేయండి' : 'మైక్రోఫోన్ నొక్కి మాట్లాడండి'}</p>

        <div>
          {status === 'idle' || status === 'stopped' ? (
            <button type="button" className={`mic-cta ${status === 'stopped' ? '' : ''}`} onClick={startRecording} disabled={!supported.recorder}>
              <span className="mic-icon" aria-hidden="true">🎤</span>
              <span>{status === 'stopped' ? 'మళ్లీ రికార్డ్' : 'మాట్లాడండి'}</span>
            </button>
          ) : status === 'recording' ? (
            <button type="button" className="mic-cta recording" onClick={pauseRecording}>
              <span className="mic-icon" aria-hidden="true">⏸</span>
              <span>ఆపండి</span>
            </button>
          ) : (
            <button type="button" className="mic-cta paused" onClick={resumeRecording}>
              <span className="mic-icon" aria-hidden="true">▶</span>
              <span>కొనసాగించు</span>
            </button>
          )}
        </div>

        <div className="btn-row btn-row-inline" style={{ width: '100%' }}>
          <button type="button" className="btn btn-secondary" onClick={pauseRecording} disabled={status !== 'recording'}>⏸ ఆపండి (Pause)</button>
          <button type="button" className="btn btn-danger" onClick={stopRecording} disabled={status !== 'recording' && status !== 'paused'}>⏹ ముగించు (Stop)</button>
        </div>
        {status === 'stopped' && <button type="button" className="btn btn-secondary" onClick={startRecording}>🔄 మళ్లీ రికార్డ్ చేయండి</button>}
      </div>

      {(finalStt || interim) && status !== 'idle' && (
        <div className="notice notice-info" aria-live="polite">
          <strong>వినిపించిన మాటలు (తాత్కాలికం)</strong>
          <div className="transcript-box" lang="te" style={{ marginTop: 6, fontSize: '1.05rem' }}>{finalStt}{interim ? <span className="muted"> {interim}</span> : null}</div>
          <div className="small muted" style={{ marginTop: 4 }}>తర్వాత మీరు సరిచేయవచ్చు. (You can edit later.)</div>
        </div>
      )}

      {audioUrl && audioBlob && status === 'stopped' && (
        <div className="card stack">
          <h2>మీ రికార్డింగ్ వినండి</h2>
          <audio controls src={audioUrl} className="audio-player" preload="metadata" />
          <p className="small muted">సరిగ్గా లేకపోతే "మళ్లీ రికార్డ్ చేయండి" నొక్కండి.</p>
        </div>
      )}
    </section>
  );
}
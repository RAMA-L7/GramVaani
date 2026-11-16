'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { detectBrowserSpeechRecognition, formatDuration } from '@/lib/utils';

type SpeechRecognitionInstance = any;

export interface BrowserSttState {
  supported: boolean;
  listening: boolean;
  interim: string;
  finalText: string;
  error?: string | null;
}

interface Props {
  onRecorded: (blob: Blob, durationMs: number, url: string) => void;
  onBrowserTranscript?: (finalText: string, interim: string) => void;
  browserSttEnabled: boolean;
  onBrowserSttEnabledChange: (v: boolean) => void;
}

export default function VoiceRecorder({ onRecorded, onBrowserTranscript, browserSttEnabled, onBrowserSttEnabledChange }: Props) {
  const [supported, setSupported] = useState<{ recorder: boolean; speech: boolean }>({ recorder: false, speech: false });
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [sttError, setSttError] = useState<string | null>(null);
  const [interim, setInterim] = useState('');
  const [finalStt, setFinalStt] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTsRef = useRef<number>(0);
  const accMsRef = useRef<number>(0);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
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

  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }
  function startTimer() {
    stopTimer();
    startTsRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedMs(accMsRef.current + (Date.now() - startTsRef.current));
    }, 200);
  }
  function stopTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  function initSpeechRecognition() {
    if (typeof window === 'undefined') return null;
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return null;
    const rec = new Ctor();
    rec.lang = 'te-IN';
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event: any) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const txt = res[0]?.transcript || '';
        if (res.isFinal) {
          finalRef.current = `${finalRef.current} ${txt}`.trim();
        } else {
          interimText += txt;
        }
      }
      setInterim(interimText);
      setFinalStt(finalRef.current);
      onBrowserTranscript?.(finalRef.current, interimText);
    };
    rec.onerror = (e: any) => {
      const msg = e?.error ? `Browser speech recognition error: ${e.error}` : 'Browser speech recognition error';
      setSttError(msg);
    };
    rec.onend = () => {
      // auto-restart while recording if enabled
      if (browserSttEnabled && mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { rec.start(); } catch {}
      }
    };
    return rec;
  }

  async function startRecording() {
    setError(null);
    setSttError(null);
    if (!supported.recorder) {
      setError('Microphone recording is not supported in this browser (MediaRecorder/getUserMedia unavailable). మైక్రోఫోన్ రికార్డింగ్ ఈ బ్రౌజర్‌లో అందుబాటులో లేదు.');
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
      setMimeType(mr.mimeType || chosen || 'audio/webm');
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
        stopTracks();
        try { recognitionRef.current?.stop?.(); } catch {}
        onRecorded(blob, finalMs, url);
      };
      mr.onerror = () => {
        setError('Recording failed due to a recorder error. రికార్డింగ్ లోపం జరిగింది. Please try again.');
        setStatus('idle');
        stopTimer();
        stopTracks();
      };
      // reset
      accMsRef.current = 0;
      setElapsedMs(0);
      setInterim('');
      setFinalStt('');
      finalRef.current = '';
      setAudioBlob(null);
      if (audioUrl) { URL.revokeObjectURL(audioUrl); setAudioUrl(null); }

      mr.start(250);
      setStatus('recording');
      startTimer();

      if (browserSttEnabled && supported.speech) {
        const rec = initSpeechRecognition();
        recognitionRef.current = rec;
        try { rec?.start?.(); } catch (e: any) { setSttError('Could not start browser speech recognition.'); }
      }
    } catch (e: any) {
      const name = e?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError('Microphone permission denied. మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. Please allow microphone access and try again.');
      } else if (name === 'NotFoundError') {
        setError('No microphone found. మైక్రోఫోన్ కనబడలేదు. Please connect a microphone.');
      } else {
        setError(`Could not start recording: ${e?.message || 'unknown error'}. రికార్డింగ్ ప్రారంభించలేకపోయాము.`);
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
      stopTimer();
      setElapsedMs(accMsRef.current);
      setStatus('paused');
      try { recognitionRef.current?.stop?.(); } catch {}
    } catch {
      setError('Pause is not supported in this browser/session. పాజ్ అందుబాటులో లేదు.');
    }
  }

  function resumeRecording() {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state !== 'paused') return;
    try {
      mr.resume();
      setStatus('recording');
      startTimer();
      if (browserSttEnabled && supported.speech) {
        try { recognitionRef.current?.start?.(); } catch {}
      }
    } catch {
      setError('Resume failed. కొనసాగించడం విఫలమైంది.');
    }
  }

  function stopRecording() {
    const mr = mediaRecorderRef.current;
    if (!mr || (mr.state !== 'recording' && mr.state !== 'paused')) return;
    try {
      if (mr.state === 'recording') accMsRef.current += Date.now() - startTsRef.current;
      mr.stop();
    } catch {
      setError('Stop failed. ఆపడం విఫలమైంది.');
      setStatus('idle');
      stopTimer();
      stopTracks();
    }
  }

  function reRecord() {
    if (status === 'recording' || status === 'paused') stopRecording();
    setTimeout(() => { void startRecording(); }, 50);
  }

  const statusLabel = status === 'recording' ? 'Recording / రికార్డింగ్' : status === 'paused' ? 'Paused / పాజ్' : status === 'stopped' ? 'Stopped / ఆగింది' : 'Idle / సిద్ధంగా';
  const statusClass = status === 'recording' ? 'status-recording' : status === 'paused' ? 'status-paused' : status === 'stopped' ? 'status-stopped' : 'status-idle';

  return (
    <section className="card">
      <h2>Microphone recording (real)</h2>
      <p className="muted small">Uses your browser microphone via <code>getUserMedia</code> + <code>MediaRecorder</code>. No simulated recording.</p>

      {!supported.recorder && (
        <div className="error">Recording not supported in this browser. మైక్రోఫోన్ రికార్డింగ్ మద్దతు లేదు. Try Chrome/Edge on desktop or Android.</div>
      )}
      {error && <div className="error">{error}</div>}

      <div className="recorder" aria-label="Voice recorder controls">
        <button
          type="button"
          className={`mic ${status === 'recording' ? 'recording' : status === 'paused' ? 'paused' : ''}`}
          onClick={status === 'idle' || status === 'stopped' ? startRecording : status === 'recording' ? pauseRecording : resumeRecording}
          disabled={!supported.recorder}
          aria-label={status === 'recording' ? 'Pause recording' : status === 'paused' ? 'Resume recording' : 'Start recording'}
        >
          {status === 'recording' ? '❚❚' : status === 'paused' ? '▶' : '🎙'}
        </button>
        <div>
          <div className="timer" aria-live="polite">{formatDuration(elapsedMs)}</div>
          <div><span className={`status-pill ${statusClass}`}>{statusLabel}</span></div>
          {mimeType && <div className="hint">Format: <code>{mimeType}</code></div>}
        </div>
        <div className="btn-row" style={{ marginTop: 0 }}>
          <button type="button" className="btn btn-small" onClick={startRecording} disabled={!supported.recorder || status === 'recording' || status === 'paused'}>Start</button>
          <button type="button" className="btn btn-small" onClick={pauseRecording} disabled={status !== 'recording'}>Pause</button>
          <button type="button" className="btn btn-small" onClick={resumeRecording} disabled={status !== 'paused'}>Resume</button>
          <button type="button" className="btn btn-small btn-danger" onClick={stopRecording} disabled={status !== 'recording' && status !== 'paused'}>Stop</button>
          <button type="button" className="btn btn-small" onClick={reRecord} disabled={!supported.recorder}>Re-record</button>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <label className="checkbox-row">
          <input type="checkbox" checked={browserSttEnabled} onChange={(e) => onBrowserSttEnabledChange(e.target.checked)} disabled={!supported.speech} />
          <span>
            Use browser Web Speech API for real-time transcript (te-IN) when available. {supported.speech ? 'Supported.' : 'Not supported in this browser.'}
          </span>
        </label>
        {!supported.speech && <p className="hint">Browser speech recognition unavailable. బ్రౌజర్ స్పీచ్ రికగ్నిషన్ అందుబాటులో లేదు. You can still record audio and use a backend ASR provider if configured.</p>}
        {sttError && <div className="error">{sttError}</div>}
        {(finalStt || interim) && (
          <div className="info">
            <strong>Browser speech (real-time, may be imperfect):</strong>
            <div className="small" lang="te" style={{ whiteSpace: 'pre-wrap', marginTop: 6 }}>{finalStt}{interim ? <span className="muted"> {interim}</span> : null}</div>
          </div>
        )}
      </div>

      {audioUrl && audioBlob && (
        <div style={{ marginTop: 12 }}>
          <h3>Playback</h3>
          <audio controls src={audioUrl} style={{ width: '100%' }} preload="metadata" />
          <p className="hint">Recorded audio ready. Size: {(audioBlob.size / 1024).toFixed(1)} KB. You can play it back or re-record before transcription.</p>
        </div>
      )}
    </section>
  );
}

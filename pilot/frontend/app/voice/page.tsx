'use client';

import { useEffect, useMemo, useState } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import { api, fetchExportBlob } from '@/lib/api';
import type { AsrProviderCapability } from '@/lib/types';
import { detectBrowserSpeechRecognition, downloadJson, errorMessage } from '@/lib/utils';
import { loadWorkflow, patchWorkflow } from '@/lib/workflow';
import { useRouter } from 'next/navigation';

type BrowserChoice = { id: string; name: string; available: boolean; requires_credentials?: boolean; reason?: string; modes?: string[]; browser?: boolean };

export default function VoicePage() {
  const router = useRouter();
  const [providers, setProviders] = useState<AsrProviderCapability[]>([]);
  const [capsError, setCapsError] = useState<string | null>(null);
  const [capsLoading, setCapsLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<string>('browser_web_speech');
  const [browserSttEnabled, setBrowserSttEnabled] = useState(true);
  const [browserTranscript, setBrowserTranscript] = useState('');
  const [browserInterim, setBrowserInterim] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioMs, setAudioMs] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [language] = useState('te-IN');

  useEffect(() => {
    let active = true;
    const wf = loadWorkflow();
    api.capabilities()
      .then((caps) => {
        if (!active) return;
        setProviders(caps.providers || []);
        const defaultId = wf.provider || caps.default_provider || (caps.providers?.find(p => p.available !== false && p.configured !== false)?.id) || (detectBrowserSpeechRecognition() ? 'browser_web_speech' : (caps.providers?.[0]?.id || ''));
        if (defaultId) setSelectedProvider(defaultId);
      })
      .catch((err) => { if (active) setCapsError(errorMessage(err)); })
      .finally(() => { if (active) setCapsLoading(false); });
    if (wf.transcript) { /* keep */ }
    return () => { active = false; };
  }, []);

  const browserSupported = useMemo(() => detectBrowserSpeechRecognition(), []);
  const providerChoices: BrowserChoice[] = useMemo(() => {
    const list: BrowserChoice[] = providers.map((p) => ({
      id: p.id,
      name: p.name || p.label || p.id,
      available: p.available !== false,
      requires_credentials: !!p.requires_credentials,
      reason: p.reason || p.note,
      modes: p.modes,
      browser: false,
    }));
    list.unshift({
      id: 'browser_web_speech',
      name: 'Browser Web Speech API (client-side, te-IN)',
      available: browserSupported,
      requires_credentials: false,
      reason: browserSupported ? 'Real-time recognition in supported browsers (Chrome/Edge). Results may vary.' : 'Not supported in this browser.',
      modes: ['realtime'],
      browser: true,
    });
    return list;
  }, [providers, browserSupported]);

  const selected = providerChoices.find((p) => p.id === selectedProvider) || providerChoices[0];

  async function handleTranscribe() {
    setError(null); setResultMsg(null);
    const wf = loadWorkflow();
    if (selectedProvider === 'browser_web_speech') {
      const text = [browserTranscript, browserInterim].filter(Boolean).join(' ').trim();
      if (!text) {
        setError('No browser speech transcript available yet. బ్రౌజర్ ట్రాన్స్క్రిప్ట్ లేదు. Enable browser speech and speak while recording, or choose a backend provider.');
        return;
      }
      patchWorkflow({
        provider: 'browser_web_speech',
        language,
        transcript: text,
        originalTranscript: wf.originalTranscript || text,
        transcriptMeta: { provider: 'browser_web_speech', simulated: false, source: 'browser', language },
      });
      setResultMsg('Browser speech transcript saved. You can review and edit it on the Transcript page.');
      router.push('/transcript');
      return;
    }

    // backend provider
    if (!selected) return;
    if (selected.available === false || selected.requires_credentials) {
      // allow attempt only if audio/text present? but must not pretend - warn clearly
    }
    if (!audioBlob && !browserTranscript.trim()) {
      setError('Please record audio first (or capture browser speech text) before sending to backend ASR. మొదట ఆడియో రికార్డ్ చేయండి.');
      return;
    }
    setBusy('transcribe');
    try {
      const res = await api.transcribe({
        provider: selectedProvider,
        audioBlob: audioBlob || undefined,
        filename: audioBlob ? `recording.${(audioBlob.type.split('/')[1] || 'webm').split(';')[0]}` : undefined,
        language,
        text: browserTranscript.trim() || null,
      });
      const transcript = (res.transcript || '').toString();
      if (!transcript.trim()) {
        setError('Transcription returned empty text. ట్రాన్స్క్రిప్షన్ ఖాళీగా వచ్చింది. Provider may be unavailable/misconfigured or audio unclear. No fake text generated.');
        patchWorkflow({ provider: selectedProvider, language, transcriptMeta: { ...res, simulated: !!res.simulated } as any });
        return;
      }
      patchWorkflow({
        provider: selectedProvider,
        language,
        transcript,
        originalTranscript: wf.originalTranscript || transcript,
        transcriptMeta: res as any,
      });
      setResultMsg(`Transcript received from ${res.provider || selectedProvider}${res.simulated ? ' (simulated/provider-side test mode if flagged by backend)' : ''}. Review and edit on Transcript page.`);
      router.push('/transcript');
    } catch (err: any) {
      setError(`Transcription failed: ${errorMessage(err)}. ట్రాన్స్క్రిప్షన్ విఫలమైంది. Check backend/provider credentials or availability.`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1>Voice reporting / వాయిస్ రిపోర్టింగ్</h1>
      <p className="muted">Real microphone workflow with start/pause/resume/stop, playback, and re-recording. Transcribe using a configured backend ASR provider or browser Web Speech API when available.</p>

      <section className="card">
        <h2>ASR provider selection</h2>
        {capsLoading && <p className="muted">Loading capabilities from backend…</p>}
        {capsError && <div className="error">Could not load <code>/asr/capabilities</code>: {capsError}. Backend may be offline; browser speech option still shown if supported.</div>}
        <div className="field">
          <label className="field-label" htmlFor="provider">Provider</label>
          <select id="provider" value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)}>
            {providerChoices.map((p) => (
              <option key={p.id} value={p.id}>{p.name}{p.available ? '' : ' (unavailable)'}{p.requires_credentials ? ' (needs credentials)' : ''}</option>
            ))}
          </select>
        </div>
        {selected && (
          <div className={selected.available && !selected.requires_credentials ? 'success' : 'notice'}>
            <strong>{selected.name}</strong>
            <div className="small">Available: {String(selected.available)} · Requires credentials/config: {String(!!selected.requires_credentials)} · Modes: {(selected.modes || []).join(', ') || 'n/a'}</div>
            {selected.reason && <div className="small" style={{ marginTop: 4 }}>{selected.reason}</div>}
            {(!selected.available || selected.requires_credentials) && selected.id !== 'browser_web_speech' && (
              <div className="small" style={{ marginTop: 4 }}><strong>Not ready:</strong> this provider may need server credentials or is unavailable. Recognition will not be faked.</div>
            )}
          </div>
        )}
      </section>

      <VoiceRecorder
        onRecorded={(blob, ms) => { setAudioBlob(blob); setAudioMs(ms); setError(null); }}
        browserSttEnabled={browserSttEnabled}
        onBrowserSttEnabledChange={setBrowserSttEnabled}
        onBrowserTranscript={(finalText, interimText) => { setBrowserTranscript(finalText); setBrowserInterim(interimText); }}
      />

      <section className="card">
        <h2>Transcribe / ట్రాన్స్క్రైబ్</h2>
        <p className="small muted">
          {audioBlob ? <>Audio recorded: {(audioBlob.size / 1024).toFixed(1)} KB, {Math.round(audioMs / 1000)}s.</> : 'No recorded audio yet.'}
          {browserTranscript ? <> Browser transcript captured ({browserTranscript.length} chars).</> : ''}
        </p>
        {error && <div className="error">{error}</div>}
        {resultMsg && <div className="success">{resultMsg}</div>}
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={handleTranscribe} disabled={!!busy}>
            {busy ? 'Working…' : selectedProvider === 'browser_web_speech' ? 'Use browser transcript' : 'Send audio for transcription'}
          </button>
          <button type="button" className="btn" onClick={() => router.push('/transcript')}>Open transcript workspace</button>
        </div>
        <p className="hint">If recognition is unavailable, the app will show an error/status instead of pretending it worked.</p>
      </section>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { api, API_BASE } from '@/lib/api';
import { detectBrowserSpeechRecognition, errorMessage } from '@/lib/utils';
import type { AsrCapabilitiesResponse } from '@/lib/types';

export default function DiagnosticsPage() {
  const [health, setHealth] = useState<any>(null);
  const [healthErr, setHealthErr] = useState<string | null>(null);
  const [caps, setCaps] = useState<AsrCapabilitiesResponse | null>(null);
  const [capsErr, setCapsErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function run() {
      setLoading(true);
      try { const h = await api.health(); if (active) setHealth(h); } catch (e) { if (active) setHealthErr(errorMessage(e)); }
      try { const c = await api.capabilities(); if (active) setCaps(c); } catch (e) { if (active) setCapsErr(errorMessage(e)); }
      if (active) setLoading(false);
    }
    void run();
    return () => { active = false; };
  }, []);

  const browserSpeech = typeof window !== 'undefined' ? detectBrowserSpeechRecognition() : false;

  return (
    <div className="stack-lg">
      <h1>Diagnostics</h1>
      <p className="muted">Technical provider/capability and integration status for developers and researchers. Not shown in the worker journey. No credentials are exposed.</p>

      <section className="card stack">
        <h2>Environment</h2>
        <div className="table-scroll"><table className="data-table"><tbody>
          <tr><th>Frontend API base</th><td><code>{API_BASE}</code></td></tr>
          <tr><th>Browser MediaRecorder/getUserMedia</th><td>{typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined' ? 'supported' : 'not supported'}</td></tr>
          <tr><th>Browser Web Speech API (client)</th><td>{browserSpeech ? 'supported' : 'not supported'}</td></tr>
        </tbody></table></div>
      </section>

      <section className="card stack">
        <h2>Backend health</h2>
        {loading && <p className="muted">Checking…</p>}
        {healthErr && <div className="notice notice-error">{healthErr}</div>}
        {health && <pre className="json">{JSON.stringify(health, null, 2)}</pre>}
      </section>

      <section className="card stack">
        <h2>ASR provider capabilities</h2>
        {loading && <p className="muted">Loading…</p>}
        {capsErr && <div className="notice notice-error">{capsErr}</div>}
        {caps && (
          <>
            <p className="small muted">Default: <code>{String(caps.default_provider ?? 'n/a')}</code></p>
            <div className="table-scroll"><table className="data-table"><thead><tr><th>Provider</th><th>Available</th><th>Configured</th><th>Requires credentials</th><th>Modes</th><th>Notes</th></tr></thead><tbody>
              {(caps.providers || []).map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name || p.label || p.id}</strong><br /><code>{p.id}</code></td>
                  <td>{String(p.available !== false)}</td>
                  <td>{String(p.configured !== false)}</td>
                  <td>{String(!!p.requires_credentials)}</td>
                  <td>{(p.modes || []).join(', ') || '—'}</td>
                  <td className="small">{p.reason || p.note || p.description || '—'}</td>
                </tr>
              ))}
            </tbody></table></div>
            <details className="simple"><summary>Raw capabilities JSON</summary><pre className="json" style={{ marginTop: 10 }}>{JSON.stringify(caps, null, 2)}</pre></details>
          </>
        )}
      </section>

      <section className="notice notice-info small">
        <strong>Worker flow behavior:</strong> Worker UI auto-selects the best available speech path (browser Web Speech for live transcript when supported; recorded audio sent to an available/configured backend provider when needed) and never fakes recognition. Provider selection and credential setup remain here for testing.
      </section>
    </div>
  );
}
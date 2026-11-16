'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/utils';

export default function ResearchFeedbackPage() {
  const [form, setForm] = useState({ name: '', role: '', ease_of_use: '3', voice_accuracy: '3', extraction_accuracy: '3', trust: '3', comments: '', suggestions: '', consent: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMsg(null);
    if (!form.consent) { setError('Consent is required to submit feedback.'); return; }
    setBusy(true);
    try {
      const res = await api.submitFeedback({
        name: form.name || undefined, role: form.role || undefined,
        ease_of_use: Number(form.ease_of_use), voice_accuracy: Number(form.voice_accuracy),
        extraction_accuracy: Number(form.extraction_accuracy), trust: Number(form.trust),
        comments: form.comments || undefined, suggestions: form.suggestions || undefined, consent: true,
      });
      setMsg(`Feedback submitted. ${res.id ? `Reference: ${res.id}.` : ''}`);
      setForm({ name: '', role: '', ease_of_use: '3', voice_accuracy: '3', extraction_accuracy: '3', trust: '3', comments: '', suggestions: '', consent: false });
    } catch (err) {
      setError(`Submission failed: ${errorMessage(err)}`);
    } finally { setBusy(false); }
  }

  return (
    <div className="stack-lg">
      <h1>Research feedback</h1>
      <p className="muted">Non-identifying pilot feedback only. Do not include beneficiary names, phone numbers, Aadhaar, or other identifying data.</p>
      <form className="card stack" onSubmit={submit}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
          <div><label className="label" htmlFor="name">Name (optional)</label><input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div><label className="label" htmlFor="role">Role (optional)</label><input id="role" value={form.role} onChange={(e) => set('role', e.target.value)} /></div>
        </div>
        {(['ease_of_use','voice_accuracy','extraction_accuracy','trust'] as const).map((k) => (
          <div key={k}><label className="label" htmlFor={k}>{k.replace(/_/g,' ')} (1-5)</label>
            <select id={k} value={form[k]} onChange={(e) => set(k, e.target.value)}>{[1,2,3,4,5].map(n => <option key={n} value={String(n)}>{n}</option>)}</select>
          </div>
        ))}
        <div><label className="label" htmlFor="comments">Comments</label><textarea id="comments" value={form.comments} onChange={(e) => set('comments', e.target.value)} /></div>
        <div><label className="label" htmlFor="suggestions">Suggestions</label><textarea id="suggestions" value={form.suggestions} onChange={(e) => set('suggestions', e.target.value)} /></div>
        <label className="checkbox-row"><input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} /><span>I consent to submit this non-identifying feedback for pilot research purposes.</span></label>
        {error && <div className="notice notice-error">{error}</div>}
        {msg && <div className="notice notice-ok">{msg}</div>}
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit feedback'}</button>
      </form>
    </div>
  );
}
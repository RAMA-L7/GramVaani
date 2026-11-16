'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { errorMessage } from '@/lib/utils';

export default function FeedbackPage() {
  const [form, setForm] = useState({ name: '', role: '', ease_of_use: '3', voice_accuracy: '3', extraction_accuracy: '3', trust: '3', comments: '', suggestions: '', consent: false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMsg(null);
    if (!form.consent) { setError('Consent is required to submit feedback for research. దయచేసి సమ్మతి ఇవ్వండి.'); return; }
    setBusy(true);
    try {
      const res = await api.submitFeedback({
        name: form.name || undefined,
        role: form.role || undefined,
        ease_of_use: Number(form.ease_of_use),
        voice_accuracy: Number(form.voice_accuracy),
        extraction_accuracy: Number(form.extraction_accuracy),
        trust: Number(form.trust),
        comments: form.comments || undefined,
        suggestions: form.suggestions || undefined,
        consent: true,
      });
      setMsg(`Feedback submitted. ${res.id ? `Reference: ${res.id}.` : ''} Thank you. ధన్యవాదాలు.`);
      setForm({ name: '', role: '', ease_of_use: '3', voice_accuracy: '3', extraction_accuracy: '3', trust: '3', comments: '', suggestions: '', consent: false });
    } catch (err) {
      setError(`Feedback submission failed: ${errorMessage(err)}. ఫీడ్‌బ్యాక్ పంపడం విఫలమైంది.`);
    } finally { setBusy(false); }
  }

  return (
    <div>
      <h1>Research feedback</h1>
      <p className="muted">Simple pilot feedback form posted to backend. Please share only non-identifying information.</p>
      <div className="notice"><strong>Privacy:</strong> Do not include beneficiary names, phone numbers, Aadhaar, or other identifying personal data. Use synthetic/non-identifying context only.</div>

      <form className="card" onSubmit={submit}>
        <div className="inline-fields">
          <div className="field"><label className="field-label" htmlFor="name">Name (optional)</label><input id="name" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
          <div className="field"><label className="field-label" htmlFor="role">Role (optional)</label><input id="role" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. tester, worker, researcher" /></div>
        </div>
        {(['ease_of_use','voice_accuracy','extraction_accuracy','trust'] as const).map((k) => (
          <div className="field" key={k}>
            <label className="field-label" htmlFor={k}>{k.replace(/_/g, ' ')} (1-5)</label>
            <select id={k} value={form[k]} onChange={(e) => set(k, e.target.value)}>
              {[1,2,3,4,5].map((n) => <option key={n} value={String(n)}>{n}</option>)}
            </select>
          </div>
        ))}
        <div className="field"><label className="field-label" htmlFor="comments">Comments</label><textarea id="comments" value={form.comments} onChange={(e) => set('comments', e.target.value)} /></div>
        <div className="field"><label className="field-label" htmlFor="suggestions">Suggestions</label><textarea id="suggestions" value={form.suggestions} onChange={(e) => set('suggestions', e.target.value)} /></div>
        <label className="checkbox-row"><input type="checkbox" checked={form.consent} onChange={(e) => set('consent', e.target.checked)} /><span>I consent to submit this non-identifying feedback for pilot research purposes.</span></label>
        {error && <div className="error">{error}</div>}
        {msg && <div className="success">{msg}</div>}
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Submitting…' : 'Submit feedback'}</button>
      </form>
    </div>
  );
}

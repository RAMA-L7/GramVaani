'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { coerceByType, detectBrowserSpeechRecognition, errorMessage, labelFor, teLabelFor } from '@/lib/utils';
import { loadWorkflow, patchWorkflow } from '@/lib/workflow';
import type { ClarificationQuestion } from '@/lib/types';

export default function QuestionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const wf = loadWorkflow();
    setAnswers(wf.answers || {});
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.clarify(wf.gaps || [], wf.answers || {}, wf.transcript, wf.extractions || []);
        const qs = res.questions || [];
        setQuestions(qs);
        if (qs.length === 0) router.replace('/report');
      } catch (e) {
        setError(`ప్రశ్నలు తీసుకురాలేకపోయాము. (${errorMessage(e)})`);
      } finally {
        setLoading(false);
      }
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = questions[index];
  const te = q ? (q.question_te || teLabelFor(q.field_id) || '') : '';
  const en = q ? (q.question_en || labelFor(q.field_id)) : '';

  function stopVoice() {
    try { recRef.current?.stop?.(); } catch {}
    setListening(false);
  }

  function startVoice() {
    if (!detectBrowserSpeechRecognition()) {
      setError('ఈ బ్రౌజర్‌లో వాయిస్ సమాధానం అందుబాటులో లేదు. టైప్ చేయండి. (Voice input not supported.)');
      return;
    }
    const w = window as any;
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    try {
      const rec = new Ctor();
      rec.lang = 'te-IN';
      rec.interimResults = false;
      rec.continuous = false;
      rec.onresult = (ev: any) => {
        const txt = ev?.results?.[0]?.[0]?.transcript || '';
        if (txt) setAnswer(txt);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      setListening(false);
      setError('వాయిస్ సమాధానం ప్రారంభించలేకపోయాము. (Could not start voice input.)');
    }
  }

  function submitCurrent() {
    if (!q) return;
    const isBool = q.type === 'boolean';
    const final = answer;
    if (!isBool && !final.trim()) { setError('దయచేసి సమాధానం ఇవ్వండి.'); return; }
    if (isBool && final === '') { setError('దయచేసి ఎంపిక చేయండి.'); return; }
    const coerced = coerceByType(final, q.type);
    const next = { ...answers, [q.field_id]: coerced };
    setAnswers(next);
    patchWorkflow({ answers: next, report: null, validation: null });
    setAnswer('');
    setError(null);
    stopVoice();
    if (index < questions.length - 1) setIndex(index + 1);
    else router.push('/report');
  }

  if (loading) {
    return <div className="card stack center"><h1>దయచేసి వేచి ఉండండి…</h1><p className="muted">ప్రశ్నలు సిద్ధం చేస్తున్నాము.</p></div>;
  }

  if (error && !q) {
    return (
      <div className="stack-lg">
        <div className="notice notice-error" role="alert"><strong>సమస్య</strong><div>{error}</div></div>
        <button type="button" className="btn btn-primary" onClick={() => router.push('/report')}>నమూనా నివేదికకు వెళ్లండి</button>
      </div>
    );
  }

  if (!q) return null;

  const isBool = q.type === 'boolean';
  const options = (q.options && q.options.length > 0) ? q.options : null;

  return (
    <div className="stack-lg">
      <p className="progress">ప్రశ్న {index + 1} / {questions.length}</p>
      <section className="card stack">
        <h1 style={{ fontSize: '1.6rem' }}>{te || en}</h1>
        {te && en && te !== en && <p className="muted">{en}</p>}

        {isBool ? (
          <div className="choice-list" role="group" aria-label="Answer choices">
            <button type="button" className="btn choice-btn" aria-pressed={answer === 'true'} onClick={() => setAnswer('true')}>✅ అవును (Yes)</button>
            <button type="button" className="btn choice-btn" aria-pressed={answer === 'false'} onClick={() => setAnswer('false')}>❌ కాదు (No)</button>
          </div>
        ) : options ? (
          <div className="choice-list" role="group" aria-label="Answer choices">
            {options.map((o) => (
              <button key={o} type="button" className="btn choice-btn" aria-pressed={answer === o} onClick={() => setAnswer(o)}>{o}</button>
            ))}
          </div>
        ) : (
          <div className="stack">
            <label className="label" htmlFor="answer">మీ సమాధానం</label>
            <input
              id="answer"
              type={q.type === 'integer' || q.type === 'number' ? 'number' : 'text'}
              inputMode={q.type === 'integer' || q.type === 'number' ? 'numeric' : 'text'}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="ఇక్కడ టైప్ చేయండి"
            />
          </div>
        )}

        <div className="btn-row btn-row-inline">
          <button type="button" className="btn btn-secondary" onClick={listening ? stopVoice : startVoice}>
            {listening ? '⏹ ఆపు' : '🎤 మాటతో సమాధానం'}
          </button>
          <button type="button" className="btn btn-primary" onClick={submitCurrent}>
            {index === questions.length - 1 ? 'ముగించు' : 'తర్వాతి ప్రశ్న'}
          </button>
        </div>
        {error && <div className="notice notice-error" role="alert">{error}</div>}
      </section>

      <button type="button" className="btn btn-secondary" onClick={() => router.push('/report')}>ప్రశ్నలు దాటవేయి (Skip)</button>
    </div>
  );
}
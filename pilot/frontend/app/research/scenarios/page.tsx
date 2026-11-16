'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { TestScenario } from '@/lib/types';
import { errorMessage } from '@/lib/utils';
import { patchWorkflow } from '@/lib/workflow';

const LOCAL_SYNTHETIC: TestScenario[] = [
  { id: 'syn-1', title: 'Normal daily report (synthetic)', category: 'normal', synthetic: true, transcript: 'ఈరోజు కేంద్రం SYN-C001 లో 24 మంది పిల్లలు హాజరయ్యారు. భోజనం పెట్టాము, 24 భోజనాలు వడ్డించాము. ప్రీస్కూల్ కార్యకలాపం: పాటలు మరియు కథలు.', notes: 'Synthetic Telugu utterance for flow testing.' },
  { id: 'syn-2', title: 'Mixed Telugu-English (synthetic)', category: 'mixed-language', synthetic: true, transcript: 'Today centre SYN-C002 లో 18 children present. Meal served అవును, meal count 18. Activity pre_school and nutrition.', notes: 'Mixed language synthetic sample.' },
  { id: 'syn-3', title: 'Missing/ambiguous info (synthetic)', category: 'missing-ambiguous', synthetic: true, transcript: 'కేంద్రంలో పిల్లలు వచ్చారు, భోజనం పెట్టాము. కార్యకలాపం జరిగింది.', notes: 'Designed to trigger clarification/gaps.' },
];

export default function ResearchScenariosPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<TestScenario[]>(LOCAL_SYNTHETIC);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'local' | 'mixed'>('local');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.testScenarios()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          setScenarios([...LOCAL_SYNTHETIC, ...data.map((s) => ({ ...s, synthetic: s.synthetic !== false }))]);
          setSource('mixed');
        }
      })
      .catch((err) => { if (active) setError(errorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function loadScenario(s: TestScenario) {
    const text = s.transcript || s.transcript_te || '';
    patchWorkflow({
      scenarioId: s.id,
      transcript: text,
      originalTranscript: text,
      transcriptMeta: { provider: 'synthetic_test_scenario', simulated: true, scenario_id: s.id, synthetic: true } as any,
      extractions: [], gaps: [], ambiguities: [], answers: {}, corrections: {}, report: null, validation: null,
    });
    setMsg(`Loaded synthetic scenario "${s.title || s.id}" into workflow.`);
    router.push('/review');
  }

  return (
    <div className="stack-lg">
      <h1>Test scenarios (synthetic)</h1>
      <p className="muted">Synthetic transcripts for flow testing only — not real recordings and not real speech evaluation.</p>
      {loading && <p className="muted">Loading scenarios…</p>}
      {error && <div className="notice notice-info">Backend scenarios unavailable ({error}). Showing local synthetic fixtures.</div>}
      {msg && <div className="notice notice-ok">{msg}</div>}
      <p className="small muted">Source: {source === 'mixed' ? 'Local + backend' : 'Local fixtures'}.</p>
      <div className="stack">
        {scenarios.map((s) => (
          <section className="card stack" key={s.id}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{s.title || s.id}</h2>
              <span className="pill pill-warn">SYNTHETIC</span>
              {s.category && <span className="pill pill-info">{s.category}</span>}
            </div>
            {s.notes && <p className="small muted">{s.notes}</p>}
            <div className="transcript-box" lang="te" style={{ background: '#f8fbf8', border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>{s.transcript || s.transcript_te || '(no text)'}</div>
            <button type="button" className="btn btn-primary" onClick={() => loadScenario(s)}>Load into worker flow (Review)</button>
          </section>
        ))}
      </div>
    </div>
  );
}
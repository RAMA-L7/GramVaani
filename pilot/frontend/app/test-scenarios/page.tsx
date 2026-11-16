'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { TestScenario } from '@/lib/types';
import { errorMessage } from '@/lib/utils';
import { patchWorkflow } from '@/lib/workflow';
import { useRouter } from 'next/navigation';

const LOCAL_SYNTHETIC: TestScenario[] = [
  { id: 'syn-1', title: 'Normal daily report (synthetic)', category: 'normal', synthetic: true, transcript: 'నేడు కేంద్రం SYN-C001 లో 24 మంది పిల్లలు హాజరయ్యారు. భోజనం పెట్టాము, 24 భోజనాలు వడ్డించాము. ప్రీస్కూల్ కార్యకలాపం: పాటలు మరియు కథలు.', notes: 'Synthetic Telugu utterance for flow testing.' },
  { id: 'syn-2', title: 'Mixed Telugu-English (synthetic)', category: 'mixed-language', synthetic: true, transcript: 'Today centre SYN-C002 లో 18 children present. Meal served అవును, meal count 18. Activity pre_school and nutrition.', notes: 'Mixed language synthetic sample.' },
  { id: 'syn-3', title: 'Missing/ambiguous info (synthetic)', category: 'missing-ambiguous', synthetic: true, transcript: 'కేంద్రంలో పిల్లలు వచ్చారు, భోజనం పెట్టాము. కార్యకలాపం జరిగింది.', notes: 'Designed to trigger clarification/gaps.' },
];

export default function TestScenariosPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<TestScenario[]>(LOCAL_SYNTHETIC);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'local' | 'backend' | 'mixed'>('local');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    api.testScenarios()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          setScenarios([...LOCAL_SYNTHETIC, ...data.map((s) => ({ ...s, synthetic: s.synthetic !== false }))]);
          setSource('mixed');
        } else {
          setSource('local');
        }
      })
      .catch((err) => { if (active) { setError(errorMessage(err)); setSource('local'); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function loadScenario(s: TestScenario) {
    const text = s.transcript || s.transcript_te || '';
    patchWorkflow({
      scenarioId: s.id,
      transcript: text,
      originalTranscript: text,
      transcriptMeta: { provider: 'synthetic_test_scenario', simulated: true, scenario_id: s.id, synthetic: true },
      extractions: [], gaps: [], ambiguities: [], answers: {}, corrections: {}, report: null, validation: null,
    });
    setMsg(`Loaded synthetic scenario "${s.title || s.id}" into transcript workspace.`);
    router.push('/transcript');
  }

  return (
    <div>
      <h1>Test scenarios (synthetic)</h1>
      <p className="muted">Select/load synthetic test utterances or transcripts for flow testing. These are <strong>not real user recordings</strong> and are clearly labeled synthetic.</p>
      <div className="notice"><strong>Synthetic only.</strong> Use these scenarios to test recording-to-report flow behavior. They do not represent real speech evaluation unless explicitly measured with real audio in evaluation.</div>
      {loading && <p className="muted">Loading scenarios from backend…</p>}
      {error && <div className="info">Backend scenarios unavailable ({error}). Showing local synthetic fixtures.</div>}
      {msg && <div className="success">{msg}</div>}
      <p className="hint">Source: {source === 'mixed' ? 'Local synthetic fixtures + backend scenarios' : 'Local synthetic fixtures'}.</p>

      <div className="grid">
        {scenarios.map((s) => (
          <section className="card" key={s.id}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
              <h2 style={{ margin: 0 }}>{s.title || s.id}</h2>
              <span className="badge badge-warn">{s.synthetic !== false ? 'SYNTHETIC' : 'TEST'}</span>
              {s.category && <span className="badge badge-info">{s.category}</span>}
            </div>
            {s.description && <p>{s.description}</p>}
            {s.notes && <p className="small muted">{s.notes}</p>}
            <div className="field-label">Transcript / utterance</div>
            <div className="span-box transcript-box" lang="te">{s.transcript || s.transcript_te || <span className="muted">(no transcript text)</span>}</div>
            <div className="btn-row">
              <button type="button" className="btn btn-primary" onClick={() => loadScenario(s)}>Load into transcript workspace</button>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

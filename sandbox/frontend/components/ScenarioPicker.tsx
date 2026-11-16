'use client';

import type { ScenarioSummary } from '@/lib/api';

interface Props {
  scenarios: ScenarioSummary[];
  selectedId: string;
  onSelect: (id: string) => void;
  loading?: boolean;
  error?: string | null;
  disabled?: boolean;
}

export default function ScenarioPicker({ scenarios, selectedId, onSelect, loading, error, disabled }: Props) {
  return (
    <section className="card">
      <h2><span className="step">1</span> Choose a scenario</h2>
      <p className="muted small">
        Each scenario is a synthetic, scripted test case used to exercise the whole flow.
      </p>
      {loading && <p className="muted small">Loading scenarios from the sandbox API…</p>}
      {error && <p className="error">Could not load scenarios: {error}</p>}
      <div className="field">
        <label className="field-label" htmlFor="scenario-select">Scenario</label>
        <select
          id="scenario-select"
          value={selectedId}
          onChange={(e) => onSelect(e.target.value)}
          disabled={disabled || loading || scenarios.length === 0}
        >
          <option value="">Select a scenario…</option>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} · {s.category} · {s.id}
            </option>
          ))}
        </select>
      </div>
      {selectedId && <p className="hint">Selected: <code>{selectedId}</code></p>}
    </section>
  );
}

'use client';

import { labelFor, type Extraction } from '@/lib/api';

interface Props {
  extractions: Extraction[];
  gaps: string[];
  ambiguities: string[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

export default function ExtractionReview({ extractions, gaps, ambiguities, values, onChange }: Props) {
  if (!extractions.length) return null;

  return (
    <section className="card">
      <h2><span className="step">4</span> Review extracted fields</h2>
      <p className="muted small">
        Each value below must still be explicitly confirmed in a later step. Correct any value before
        confirming.
      </p>
      {gaps.length > 0 && (
        <p className="notice">
          Missing fields to clarify: {gaps.map((g) => labelFor(g)).join(', ')}
        </p>
      )}
      {ambiguities.length > 0 && (
        <p className="notice">
          Ambiguities flagged: {ambiguities.map((a) => labelFor(a)).join(', ')}
        </p>
      )}

      <div className="extraction-list">
        {extractions.map((ex, idx) => (
          <div className="extraction" key={`${ex.field_id}-${idx}`}>
            <div className="extraction-head">
              <strong>{labelFor(ex.field_id)}</strong>
              <code className="small">{ex.field_id}</code>
            </div>
            <div className="extraction-body">
              <div>
                <span className="muted small">Extracted value</span>
                <p className="value">{String(ex.value)}</p>
              </div>
              <div>
                <span className="muted small">Source phrase</span>
                <p className="source-phrase">“{ex.raw_text || '—'}”</p>
              </div>
            </div>
            <div className="extraction-meta">
              <span>Confidence: {typeof ex.confidence === 'number' ? `${Math.round(ex.confidence * 100)}%` : 'n/a'}</span>
              {ex.needs_confirmation && <span className="badge badge-warn">confirmation needed</span>}
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label" htmlFor={`corr-${ex.field_id}-${idx}`}>
                Your corrected value (leave unchanged to accept)
              </label>
              <input
                id={`corr-${ex.field_id}-${idx}`}
                type="text"
                value={values[ex.field_id] ?? ''}
                onChange={(e) => onChange(ex.field_id, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

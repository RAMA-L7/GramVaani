'use client';

import { buildHighlightedSegments, getSpanText, labelFor, stringifyValue, teLabelFor } from '@/lib/utils';
import type { Extraction } from '@/lib/types';

interface Props {
  transcript: string;
  extractions: Extraction[];
  gaps: string[];
  ambiguities: string[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

export default function ExtractionReview({ transcript, extractions, gaps, ambiguities, values, onChange }: Props) {
  const segments = buildHighlightedSegments(transcript || '', extractions || []);
  return (
    <section className="card">
      <h2>Grounded extracted values (exact source spans)</h2>
      <p className="muted small">Each value shows its extracted source span from the transcript when available. Review and correct before confirmation. Worker must explicitly confirm.</p>
      {(gaps.length > 0 || ambiguities.length > 0) && (
        <div className="notice">
          {gaps.length > 0 && <div><strong>Missing / gaps:</strong> {gaps.map(labelFor).join(', ')}</div>}
          {ambiguities.length > 0 && <div><strong>Ambiguities:</strong> {ambiguities.map(labelFor).join(', ')}</div>}
        </div>
      )}
      {transcript ? (
        <div className="span-box" aria-label="Transcript with highlighted extraction spans">
          <div className="field-label">Transcript with highlighted spans / హైలైట్ చేసిన భాగాలు</div>
          <div className="transcript-box" lang="te">
            {segments.map((seg, i) => seg.highlight ? <mark key={i} className="span-hl" title={seg.fieldId ? labelFor(seg.fieldId) : 'source span'}>{seg.text}</mark> : <span key={i}>{seg.text}</span>)}
          </div>
          <p className="hint">Highlights indicate extracted source spans (merged where overlapping). Exact span offsets are preserved from extraction.</p>
        </div>
      ) : <p className="hint">No transcript available for span highlighting.</p>}

      <div className="extraction-list">
        {extractions.map((ex, idx) => {
          const spanText = getSpanText(transcript || '', ex.source_span);
          const te = teLabelFor(ex.field_id);
          return (
            <div className="extraction" key={`${ex.field_id}-${idx}`}>
              <div className="extraction-head">
                <div><strong>{labelFor(ex.field_id)}</strong>{te ? <span className="muted"> / {te}</span> : null}<br /><code className="small">{ex.field_id}</code></div>
                {ex.needs_confirmation !== false && <span className="badge badge-warn">review required</span>}
              </div>
              <div className="extraction-meta">
                <span>Confidence: {typeof ex.confidence === 'number' ? `${Math.round(ex.confidence * 100)}%` : 'n/a'}</span>
                <span>Span: {Array.isArray(ex.source_span) ? `[${ex.source_span[0]}, ${ex.source_span[1]}]` : '—'}</span>
              </div>
              <div className="span-box">
                <div className="small muted">Extracted value</div>
                <div><strong>{stringifyValue(ex.value) || '—'}</strong></div>
                <div className="small muted" style={{ marginTop: 6 }}>Exact source span text</div>
                <div lang="te">“{spanText || ex.raw_text || '—'}”</div>
                {ex.raw_text && spanText && ex.raw_text !== spanText ? <div className="hint">Provider raw_text: “{ex.raw_text}”</div> : null}
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label" htmlFor={`corr-${ex.field_id}-${idx}`}>Correction (edit before confirmation)</label>
                <input id={`corr-${ex.field_id}-${idx}`} type="text" value={values[ex.field_id] ?? stringifyValue(ex.value)} onChange={(e) => onChange(ex.field_id, e.target.value)} />
              </div>
            </div>
          );
        })}
        {extractions.length === 0 && <p className="muted">No extracted fields yet. Run extraction from the transcript.</p>}
      </div>
    </section>
  );
}

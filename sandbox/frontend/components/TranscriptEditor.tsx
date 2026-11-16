'use client';

interface Props {
  transcript: string;
  onChange: (value: string) => void;
  simulated?: boolean;
  provider?: string;
  durationMs?: number;
  disabled?: boolean;
}

export default function TranscriptEditor({ transcript, onChange, simulated, provider, durationMs, disabled }: Props) {
  return (
    <section className="card">
      <h2><span className="step">3</span> Review and edit the transcript</h2>
      <div className="notice">
        <strong>Scripted / simulated transcription.</strong> This text comes from the scenario file, not
        from live speech recognition. No audio is captured or uploaded. You may edit it before extraction.
      </div>
      {provider && (
        <p className="hint">
          Provider: <code>{provider}</code>
          {simulated ? ' · simulated' : ''}
          {typeof durationMs === 'number' ? ` · reported duration ${durationMs} ms` : ''}
        </p>
      )}
      <div className="field">
        <label className="field-label" htmlFor="transcript">Scripted transcript (editable)</label>
        <textarea
          id="transcript"
          value={transcript}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="The scripted transcript will appear here after the simulated recording."
          lang="te"
        />
      </div>
      <p className="hint">
        {transcript.trim() ? `${transcript.trim().length} characters` : 'No transcript yet.'}
      </p>
    </section>
  );
}

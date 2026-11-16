'use client';

import { labelFor } from '@/lib/utils';
import type { ClarificationQuestion } from '@/lib/types';

interface Props {
  question: ClarificationQuestion;
  answer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  index: number;
  total: number;
  loading?: boolean;
}

export default function ClarificationCard({ question, answer, onAnswerChange, onSubmit, index, total, loading }: Props) {
  const isBool = question.type === 'boolean';
  const isNumber = question.type === 'integer' || question.type === 'number';
  const canSubmit = loading ? false : isBool ? answer !== '' : answer.trim() !== '';
  return (
    <section className="card">
      <h2>Clarification / స్పష్టత</h2>
      <p className="muted small">Question {index + 1} of {total} · {labelFor(question.field_id)} <code>{question.field_id}</code></p>
      <p style={{ fontSize: '1.1rem', fontWeight: 700 }} lang="te">{question.question_te}</p>
      <p className="muted">{question.question_en}</p>
      {isBool ? (
        <div className="choice-row">
          <button type="button" className={`btn ${answer === 'true' ? 'btn-primary' : ''}`} onClick={() => onAnswerChange('true')}>Yes / అవును</button>
          <button type="button" className={`btn ${answer === 'false' ? 'btn-primary' : ''}`} onClick={() => onAnswerChange('false')}>No / కాదు</button>
        </div>
      ) : question.options && question.options.length > 0 ? (
        <div className="field">
          <label className="field-label" htmlFor="clar-opt">Select</label>
          <select id="clar-opt" value={answer} onChange={(e) => onAnswerChange(e.target.value)}>
            <option value="">-- select --</option>
            {question.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ) : (
        <div className="field">
          <label className="field-label" htmlFor="clarification-answer">Answer</label>
          <input id="clarification-answer" type={isNumber ? 'number' : 'text'} value={answer} onChange={(e) => onAnswerChange(e.target.value)} />
        </div>
      )}
      <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={!canSubmit}>
        {loading ? 'Saving…' : index === total - 1 ? 'Finish clarifications' : 'Next question'}
      </button>
    </section>
  );
}

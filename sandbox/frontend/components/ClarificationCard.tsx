'use client';

import { labelFor, type ClarificationQuestion } from '@/lib/api';

interface Props {
  question: ClarificationQuestion;
  answer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
  index: number;
  total: number;
  loading?: boolean;
}

export default function ClarificationCard({
  question, answer, onAnswerChange, onSubmit, index, total, loading,
}: Props) {
  const isBool = question.type === 'boolean';
  const isNumber = question.type === 'integer';
  const canSubmit = loading ? false : isBool ? answer !== '' : answer.trim() !== '';

  return (
    <section className="card">
      <h2><span className="step">5</span> Clarify missing information</h2>
      <p className="muted small">
        Question {index + 1} of {total} · field <code>{question.field_id}</code> ({labelFor(question.field_id)})
      </p>
      <p className="question-te" lang="te">{question.question_te}</p>
      <p className="question-en">{question.question_en}</p>

      {isBool ? (
        <div className="choice-row">
          <button type="button" className={`btn btn-small ${answer === 'true' ? 'selected' : ''}`} onClick={() => onAnswerChange('true')}>
            Yes / అవును
          </button>
          <button type="button" className={`btn btn-small ${answer === 'false' ? 'selected' : ''}`} onClick={() => onAnswerChange('false')}>
            No / కాదు
          </button>
        </div>
      ) : (
        <div className="field">
          <label className="field-label" htmlFor="clarification-answer">Your answer</label>
          <input
            id="clarification-answer"
            type={isNumber ? 'number' : 'text'}
            inputMode={isNumber ? 'numeric' : 'text'}
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your answer"
          />
        </div>
      )}

      <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={!canSubmit}>
        {loading ? 'Loading…' : index === total - 1 ? 'Finish clarifications' : 'Next question'}
      </button>
    </section>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ScenarioPicker from '@/components/ScenarioPicker';
import TranscriptEditor from '@/components/TranscriptEditor';
import ExtractionReview from '@/components/ExtractionReview';
import ClarificationCard from '@/components/ClarificationCard';
import ReportPreview from '@/components/ReportPreview';
import GatewayResult from '@/components/GatewayResult';
import {
  api, coerceByType, coerceLike, errorMessage, newIdempotencyKey, stringifyValue,
  type ClarificationQuestion, type Extraction, type GatewayResultData,
  type Scenario, type ScenarioSummary, type TranscribeResponse,
} from '@/lib/api';

type Phase = 'idle' | 'recorded' | 'extracted' | 'clarifying' | 'confirmed' | 'submitted';

export default function VoicePage() {
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [scenariosError, setScenariosError] = useState<string | null>(null);
  const [scenariosLoading, setScenariosLoading] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [scenarioDetail, setScenarioDetail] = useState<Scenario | null>(null);

  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [transcript, setTranscript] = useState('');
  const [transcribeMeta, setTranscribeMeta] = useState<TranscribeResponse | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [extractions, setExtractions] = useState<Extraction[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);
  const [ambiguities, setAmbiguities] = useState<string[]>([]);
  const [correctionValues, setCorrectionValues] = useState<Record<string, string>>({});

  const [questions, setQuestions] = useState<ClarificationQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  const [confirmKey] = useState(() => newIdempotencyKey('confirm'));
  const [submitKey] = useState(() => newIdempotencyKey('submit'));
  const [report, setReport] = useState<Awaited<ReturnType<typeof api.confirm>>['report'] | null>(null);
  const [validation, setValidation] = useState<Awaited<ReturnType<typeof api.confirm>>['validation'] | null>(null);
  const [gatewayResult, setGatewayResult] = useState<GatewayResultData | null>(null);
  const [gatewayError, setGatewayError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>('idle');

  useEffect(() => {
    let active = true;
    api.getScenarios()
      .then((data) => { if (active) setScenarios(data || []); })
      .catch((err) => { if (active) setScenariosError(errorMessage(err)); })
      .finally(() => { if (active) setScenariosLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    setScenarioDetail(null);
    setError(null);
    setScenarioDetailState(id);
  }, []);

  const setScenarioDetailState = useCallback((id: string) => {
    if (!id) return;
    api.getScenario(id).then(setScenarioDetail).catch(() => setScenarioDetail(null));
  }, []);

  const startRecording = () => {
    if (!selectedId) return;
    setError(null);
    setRecording(true);
    setElapsed(0);
    stopTimer();
    timerRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
  };

  const stopRecording = async () => {
    setRecording(false);
    stopTimer();
    setBusy('transcribe');
    setError(null);
    try {
      const res = await api.transcribe(selectedId, null);
      setTranscript(res.transcript || '');
      setTranscribeMeta(res);
      setPhase('recorded');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const runExtraction = async () => {
    if (!selectedId || !transcript.trim()) return;
    setBusy('extract');
    setError(null);
    setQuestions([]);
    setQuestionIndex(0);
    setCurrentAnswer('');
    setAnswers({});
    try {
      const res = await api.extract(transcript, selectedId);
      const exs = res.extractions || [];
      setExtractions(exs);
      setGaps(res.gaps || []);
      setAmbiguities(res.ambiguities || []);
      const init: Record<string, string> = {};
      exs.forEach((ex) => { init[ex.field_id] = stringifyValue(ex.value); });
      setCorrectionValues(init);
      setPhase('extracted');
      if ((res.gaps || []).length > 0) {
        const clar = await api.clarify(res.gaps, {});
        setQuestions(clar.questions || []);
        setPhase('clarifying');
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const submitAnswer = () => {
    if (!questions[questionIndex]) return;
    const q = questions[questionIndex];
    const coerced = coerceByType(currentAnswer, q.type);
    setAnswers((prev) => ({ ...prev, [q.field_id]: coerced }));
    setCurrentAnswer('');
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((i) => i + 1);
    } else {
      setQuestionIndex(questions.length);
      setPhase('confirmed');
    }
  };

  const handleConfirm = async () => {
    setBusy('confirm');
    setError(null);
    try {
      const finalExtractions = extractions.map((ex) => ({
        ...ex,
        value: coerceLike(correctionValues[ex.field_id] ?? stringifyValue(ex.value), ex.value),
      }));
      const corrections: Record<string, unknown> = {};
      extractions.forEach((ex) => {
        const edited = correctionValues[ex.field_id] ?? stringifyValue(ex.value);
        if (edited !== stringifyValue(ex.value)) {
          corrections[ex.field_id] = coerceLike(edited, ex.value);
        }
      });
      const res = await api.confirm({
        extractions: finalExtractions,
        answers,
        corrections,
        scenario_id: selectedId,
        idempotency_key: confirmKey,
      });
      setReport(res.report);
      setValidation(res.validation);
      setPhase('confirmed');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const handleSubmitGateway = async () => {
    if (!report) return;
    setBusy('gateway');
    setGatewayError(null);
    setError(null);
    try {
      const res = await api.submit(report, submitKey, selectedId);
      setGatewayResult(res);
      setPhase('submitted');
    } catch (err) {
      setGatewayError(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const handleReset = () => {
    stopTimer();
    setSelectedId('');
    setScenarioDetail(null);
    setRecording(false);
    setElapsed(0);
    setTranscript('');
    setTranscribeMeta(null);
    setExtractions([]);
    setGaps([]);
    setAmbiguities([]);
    setCorrectionValues({});
    setQuestions([]);
    setQuestionIndex(0);
    setCurrentAnswer('');
    setAnswers({});
    setReport(null);
    setValidation(null);
    setGatewayResult(null);
    setGatewayError(null);
    setError(null);
    setPhase('idle');
  };

  const mmss = useMemo(
    () => `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`,
    [elapsed],
  );

  const showExtraction = extractions.length > 0;
  const questionsDone = questions.length === 0 || questionIndex >= questions.length;
  const currentQuestion = questions[questionIndex];

  return (
    <div>
      <h1>GramVaani Voice Assistant</h1>
      <p className="muted">
        Simulated Telugu voice-to-report flow. Transcription is scripted and no audio is captured.
      </p>

      <ScenarioPicker
        scenarios={scenarios}
        selectedId={selectedId}
        onSelect={handleSelect}
        loading={scenariosLoading}
        error={scenariosError}
        disabled={recording}
      />

      {scenarioDetail && (
        <section className="card">
          <h2>Scenario details</h2>
          <p className="small muted">
            Category <code>{scenarioDetail.category}</code> · Gateway mode{' '}
            <code>{scenarioDetail.gateway?.mode || 'accept'}</code>
          </p>
          {scenarioDetail.notes && <p className="small">{scenarioDetail.notes}</p>}
          {scenarioDetail.synthetic && <p className="hint">synthetic: true</p>}
        </section>
      )}

      <section className="card">
        <h2><span className="step">2</span> Simulated recording</h2>
        <p className="muted small">
          The microphone button is a UI simulation only. It starts a timer and then loads the
          scenario&apos;s scripted transcript from the API. No audio is recorded or uploaded.
        </p>
        <div className="recorder">
          <button
            type="button"
            className={`mic ${recording ? 'recording' : ''}`}
            onClick={recording ? stopRecording : startRecording}
            disabled={!selectedId || busy === 'transcribe'}
            aria-label={recording ? 'Stop simulated recording' : 'Start simulated recording'}
          >
            {recording ? '■' : '🎙'}
          </button>
          <div>
            <span className="timer" aria-live="polite">{mmss}</span>
            <div className="hint">{recording ? 'Simulated recording in progress' : 'Not recording'}</div>
          </div>
          {busy === 'transcribe' && <span className="muted small">Loading scripted transcript…</span>}
        </div>
        {!selectedId && <p className="hint" style={{ marginTop: 8 }}>Choose a scenario above first.</p>}
      </section>

      {error && <p className="error">{error}</p>}

      {phase !== 'idle' && (
        <TranscriptEditor
          transcript={transcript}
          onChange={setTranscript}
          simulated={transcribeMeta?.simulated}
          provider={transcribeMeta?.provider}
          durationMs={transcribeMeta?.duration_ms}
          disabled={!!busy}
        />
      )}

      {phase !== 'idle' && (
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={runExtraction} disabled={!!busy || !transcript.trim()}>
            {busy === 'extract' ? 'Extracting…' : showExtraction ? 'Re-run extraction' : 'Extract fields from transcript'}
          </button>
        </div>
      )}

      {showExtraction && (
        <ExtractionReview
          extractions={extractions}
          gaps={gaps}
          ambiguities={ambiguities}
          values={correctionValues}
          onChange={(fieldId, value) => setCorrectionValues((prev) => ({ ...prev, [fieldId]: value }))}
        />
      )}

      {questions.length > 0 && !questionsDone && currentQuestion && (
        <ClarificationCard
          question={currentQuestion}
          answer={currentAnswer}
          onAnswerChange={setCurrentAnswer}
          onSubmit={submitAnswer}
          index={questionIndex}
          total={questions.length}
          loading={!!busy}
        />
      )}
      {questions.length > 0 && questionsDone && (
        <p className="validation valid" style={{ marginTop: 4 }}>All clarification questions answered.</p>
      )}

      {showExtraction && questionsDone && (
        <section className="card">
          <h2><span className="step">6</span> Confirm before generating a report</h2>
          <p className="muted small">
            No value enters the report until you explicitly confirm. Review the corrected values and
            clarification answers above, then press the button.
          </p>
          <p className="hint">Confirm idempotency key: <code>{confirmKey}</code></p>
          <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={!!busy}>
            {busy === 'confirm' ? 'Generating report…' : 'Confirm and generate report'}
          </button>
        </section>
      )}

      {report && validation && (
        <ReportPreview report={report} validation={validation} />
      )}

      {report && (
        <section className="card">
          <h2>Transfer via simulated gateway</h2>
          <p className="muted small">
            This sends the confirmed report to the sandbox gateway only. It does not contact any
            government system. The idempotency key is kept the same across retries.
          </p>
          <p className="hint">Submit idempotency key: <code>{submitKey}</code></p>
          <button type="button" className="btn btn-primary" onClick={handleSubmitGateway} disabled={!!busy}>
            {busy === 'gateway' ? 'Submitting…' : gatewayResult ? 'Submit again (same key)' : 'Submit to gateway'}
          </button>
        </section>
      )}

      <GatewayResult
        result={gatewayResult}
        loading={busy === 'gateway'}
        error={gatewayError}
        onRetry={handleSubmitGateway}
        onReset={handleReset}
      />

      {(phase === 'submitted' || gatewayResult) && (
        <div className="btn-row">
          <button type="button" className="btn" onClick={handleReset}>Start over with another scenario</button>
        </div>
      )}
    </div>
  );
}

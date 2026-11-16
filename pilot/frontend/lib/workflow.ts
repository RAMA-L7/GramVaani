import type { Extraction, PilotReport, Validation } from './types';

const KEY = 'gramvaani_pilot_workflow_v1';

export interface WorkflowState {
  provider?: string;
  language?: string;
  transcript: string;
  originalTranscript: string;
  transcriptMeta?: Record<string, unknown>;
  extractions: Extraction[];
  gaps: string[];
  ambiguities: string[];
  answers: Record<string, unknown>;
  corrections: Record<string, unknown>;
  report: PilotReport | null;
  validation: Validation | null;
  scenarioId?: string;
  updatedAt?: string;
}

export function emptyWorkflow(): WorkflowState {
  return {
    transcript: '',
    originalTranscript: '',
    extractions: [],
    gaps: [],
    ambiguities: [],
    answers: {},
    corrections: {},
    report: null,
    validation: null,
  };
}

export function loadWorkflow(): WorkflowState {
  if (typeof window === 'undefined') return emptyWorkflow();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyWorkflow();
    const parsed = JSON.parse(raw) as Partial<WorkflowState>;
    return { ...emptyWorkflow(), ...parsed };
  } catch {
    return emptyWorkflow();
  }
}

export function saveWorkflow(state: WorkflowState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...state, updatedAt: new Date().toISOString() }));
  } catch { /* ignore */ }
}

export function patchWorkflow(patch: Partial<WorkflowState>): WorkflowState {
  const next = { ...loadWorkflow(), ...patch, updatedAt: new Date().toISOString() };
  saveWorkflow(next);
  return next;
}

export function clearWorkflow() {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
}

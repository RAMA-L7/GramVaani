// Typed fetch wrapper for the simulated GramVaani backend.
// All calls go to http://localhost:8000/api (see API_CONTRACT.md).

export const API_BASE = 'http://localhost:8000/api';

export type ScenarioCategory =
  | 'normal'
  | 'mixed-language'
  | 'missing'
  | 'ambiguous'
  | 'contradiction'
  | 'duplicate'
  | 'extraction-error'
  | 'network'
  | 'correction';

export type GatewayMode = 'accept' | 'reject' | 'duplicate' | 'network_failure';

export interface ScenarioSummary {
  id: string;
  title: string;
  category: string;
}

export interface Scenario extends ScenarioSummary {
  transcript: string;
  expected_extracted?: Record<string, unknown>;
  expected_missing?: string[];
  clarification_answers?: Record<string, unknown>;
  worker_corrections?: Record<string, unknown>;
  expected_validation?: { valid: boolean; errors: string[] };
  gateway?: { mode: GatewayMode; fail_first_attempt?: boolean };
  notes?: string;
  synthetic?: boolean;
}

export interface Extraction {
  field_id: string;
  value: unknown;
  raw_text: string;
  source_span: [number, number];
  confidence: number;
  needs_confirmation: boolean;
}

export interface ClarificationQuestion {
  field_id: string;
  question_te: string;
  question_en: string;
  type: string;
}

export interface ClarifyResponse {
  questions: ClarificationQuestion[];
}

export interface ExtractResponse {
  extractions: Extraction[];
  gaps: string[];
  ambiguities: string[];
}

export interface TranscribeResponse {
  transcript: string;
  provider: string;
  simulated: boolean;
  duration_ms: number;
}

export interface Validation {
  valid: boolean;
  errors: string[];
}

export interface WorkerRef {
  worker_code: string;
  centre_code: string;
}

export interface Confirmation {
  confirmed_by: string;
  confirmed_at: string;
}

export interface SandboxReport {
  schema_version: string;
  worker: WorkerRef;
  report_date: string;
  fields: Record<string, unknown>;
  transcript_ref: string | null;
  confirmation: Confirmation;
  status: string;
}

export interface ConfirmResponse {
  report: SandboxReport;
  validation: Validation;
}

export interface GatewayResultData {
  status: 'accepted' | 'duplicate' | 'rejected';
  receipt_id: string;
  errors: string[];
  dashboard_entry?: unknown;
}

export interface DashboardEntry {
  receipt_id: string;
  submitted_at: string;
  report: SandboxReport;
  status: string;
}

export interface ConfirmPayload {
  extractions: Extraction[];
  answers: Record<string, unknown>;
  corrections: Record<string, unknown>;
  scenario_id: string;
  idempotency_key: string;
}

export const FIELD_LABELS: Record<string, { te: string; en: string }> = {
  report_date: { te: 'నివేదిక తేదీ', en: 'Report date' },
  centre_code: { te: 'కేంద్రం కోడ్', en: 'Centre code' },
  activity_type: { te: 'కార్యకలాపం', en: 'Activity' },
  children_enrolled: { te: 'నమోదైన పిల్లలు', en: 'Children enrolled' },
  children_present: { te: 'హాజరైన పిల్లలు', en: 'Children present' },
  children_absent: { te: 'గైర్హాజరు', en: 'Children absent' },
  meal_served: { te: 'భోజనం పెట్టారా', en: 'Meal served' },
  meal_count: { te: 'భోజనం పొందిన పిల్లలు', en: 'Meals served count' },
  preschool_activity: { te: 'ప్రీస్కూల్ కార్యకలాపం', en: 'Preschool activity' },
  photo_attached: { te: 'చిత్రం జోడించబడింది', en: 'Photo attached' },
  remarks: { te: 'వ్యాఖ్యలు', en: 'Remarks' },
};

export const ACTIVITY_OPTIONS = [
  'pre_school',
  'nutrition',
  'weighing',
  'home_visit',
  'health_check',
];

export function labelFor(fieldId: string): string {
  return FIELD_LABELS[fieldId]?.en || FIELD_LABELS[fieldId]?.te || fieldId;
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

export function coerceLike(raw: string, sample: unknown): unknown {
  if (typeof sample === 'number') {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  if (typeof sample === 'boolean') {
    return raw === 'true' || raw.toLowerCase() === 'yes';
  }
  if (Array.isArray(sample)) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return raw;
}

export function coerceByType(raw: string, type: string): unknown {
  if (type === 'integer') {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  if (type === 'boolean') {
    return raw === 'true' || raw.toLowerCase() === 'yes';
  }
  if (type === 'enum_list') {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return raw;
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export function newIdempotencyKey(prefix = 'sandbox'): string {
  let rand = '';
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) rand = crypto.randomUUID();
  } catch {
    // ignore
  }
  if (!rand) rand = Math.random().toString(36).slice(2);
  return `${prefix}-${Date.now()}-${rand}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    });
  } catch {
    throw new Error('Could not reach the sandbox API at http://localhost:8000. Is the backend running?');
  }
  if (!res.ok) {
    let detail: unknown = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      detail = body?.detail ?? body?.message ?? body ?? detail;
    } catch {
      // non-JSON error body
    }
    if (Array.isArray(detail)) {
      detail = detail.map((d) => (typeof d === 'object' && d ? JSON.stringify(d) : String(d))).join('; ');
    }
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }
  return (await res.json()) as T;
}

export const api = {
  health: () => apiFetch<{ status: string; sandbox: boolean }>('/health'),
  getScenarios: () => apiFetch<ScenarioSummary[]>('/scenarios'),
  getScenario: (id: string) => apiFetch<Scenario>(`/scenarios/${encodeURIComponent(id)}`),
  transcribe: (scenario_id: string, text: string | null = null) =>
    apiFetch<TranscribeResponse>('/voice/transcribe', {
      method: 'POST',
      body: JSON.stringify({ scenario_id, text }),
    }),
  extract: (transcript: string, scenario_id: string) =>
    apiFetch<ExtractResponse>('/voice/extract', {
      method: 'POST',
      body: JSON.stringify({ transcript, scenario_id }),
    }),
  clarify: (gaps: string[], answers: Record<string, unknown>) =>
    apiFetch<ClarifyResponse>('/voice/clarify', {
      method: 'POST',
      body: JSON.stringify({ gaps, answers }),
    }),
  confirm: (payload: ConfirmPayload) =>
    apiFetch<ConfirmResponse>('/voice/confirm', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  submit: (report: SandboxReport, idempotency_key: string, scenario_id: string) =>
    apiFetch<GatewayResultData>('/gateway/submit', {
      method: 'POST',
      body: JSON.stringify({ report, idempotency_key, scenario_id }),
    }),
  gatewayReports: () => apiFetch<DashboardEntry[]>('/gateway/reports'),
};

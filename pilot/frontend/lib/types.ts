export type AsrMode = 'realtime' | 'batch' | 'streaming' | 'upload' | string;

export interface AsrProviderCapability {
  id: string;
  name?: string;
  label?: string;
  available?: boolean;
  configured?: boolean;
  requires_credentials?: boolean;
  modes?: AsrMode[];
  languages?: string[];
  reason?: string;
  note?: string;
  simulated?: boolean;
  description?: string;
}

export interface AsrCapabilitiesResponse {
  providers: AsrProviderCapability[];
  default_provider?: string | null;
  browser_web_speech_supported?: boolean;
}

export interface TranscribeResponse {
  transcript: string;
  provider: string;
  simulated?: boolean;
  duration_ms?: number;
  confidence?: number;
  language?: string;
  segments?: Array<{ text: string; start?: number; end?: number; confidence?: number }>;
  raw?: unknown;
}

export interface Extraction {
  field_id: string;
  value: unknown;
  raw_text: string;
  source_span: [number, number] | number[] | null;
  confidence?: number;
  needs_confirmation?: boolean;
}

export interface ClarificationQuestion {
  field_id: string;
  question_te: string;
  question_en: string;
  type: string;
  options?: string[];
}

export interface ExtractResponse {
  extractions: Extraction[];
  gaps: string[];
  ambiguities: string[];
  transcript?: string;
}

export interface ClarifyResponse {
  questions: ClarificationQuestion[];
}

export interface Validation {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface WorkerRef {
  worker_code: string;
  centre_code: string;
  name?: string;
}

export interface Confirmation {
  confirmed_by: string;
  confirmed_at: string;
}

export interface PilotReport {
  schema_version?: string;
  worker: WorkerRef;
  report_date: string;
  fields: Record<string, unknown>;
  transcript_ref?: string | null;
  original_transcript?: string;
  edited_transcript?: string;
  extractions?: Extraction[];
  clarification_answers?: Record<string, unknown>;
  confirmation: Confirmation;
  status: string;
  sample?: boolean;
  label?: string;
}

export interface ConfirmResponse {
  report: PilotReport;
  validation: Validation;
}

export interface DraftSummary {
  id: string;
  updated_at?: string;
  report_date?: string;
  status?: string;
  title?: string;
}

export interface DraftPayload {
  id?: string;
  transcript?: string;
  original_transcript?: string;
  report?: PilotReport;
  extractions?: Extraction[];
  answers?: Record<string, unknown>;
  corrections?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface FeedbackPayload {
  name?: string;
  role?: string;
  phone?: string;
  ease_of_use?: number | string;
  voice_accuracy?: number | string;
  extraction_accuracy?: number | string;
  trust?: number | string;
  comments?: string;
  suggestions?: string;
  scenario_id?: string;
  consent?: boolean;
}

export interface EvaluationSummary {
  available?: boolean;
  message?: string;
  simulated?: boolean;
  synthetic?: boolean;
  real_speech?: boolean;
  updated_at?: string;
  metrics?: Record<string, unknown>;
  runs?: Array<Record<string, unknown>>;
  notes?: string[];
  source?: string;
}

export interface TestScenario {
  id: string;
  title?: string;
  category?: string;
  transcript?: string;
  transcript_te?: string;
  description?: string;
  synthetic?: boolean;
  expected?: Record<string, unknown>;
  notes?: string;
}

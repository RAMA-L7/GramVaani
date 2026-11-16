import type {
  AsrCapabilitiesResponse, ClarifyResponse, ConfirmResponse, DraftPayload, DraftSummary,
  EvaluationSummary, ExtractResponse, FeedbackPayload, PilotReport, TestScenario, TranscribeResponse,
} from './types';

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8010/api').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  detail?: unknown;
  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

function toUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

async function parseBody(res: Response): Promise<any> {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return null; }
  }
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(toUrl(path), init);
  } catch {
    throw new ApiError(`Cannot reach pilot backend at ${API_BASE}. Is it running?`, 0);
  }
  const body = await parseBody(res);
  if (!res.ok) {
    let detail = body?.detail ?? body?.message ?? body?.error ?? body;
    if (Array.isArray(detail)) {
      detail = detail.map((d) => (typeof d === 'object' && d ? JSON.stringify(d) : String(d))).join('; ');
    }
    const msg = typeof detail === 'string' ? detail : (detail ? JSON.stringify(detail) : `Request failed (${res.status})`);
    throw new ApiError(msg, res.status, body);
  }
  return body as T;
}

function jsonHeaders(extra?: HeadersInit): HeadersInit {
  return { 'Content-Type': 'application/json', ...(extra || {}) };
}

export const api = {
  health: () => request<{ status: string; pilot?: boolean; service?: string }>('/health'),
  capabilities: () => request<AsrCapabilitiesResponse>('/asr/capabilities'),

  transcribe: async (params: {
    provider?: string;
    scenario_id?: string;
    text?: string | null;
    audioBlob?: Blob | null;
    filename?: string;
    language?: string;
  }): Promise<TranscribeResponse> => {
    if (params.audioBlob) {
      const form = new FormData();
      form.append('audio', params.audioBlob, params.filename || 'recording.webm');
      form.append('file', params.audioBlob, params.filename || 'recording.webm');
      if (params.provider) form.append('provider', params.provider);
      if (params.scenario_id) form.append('scenario_id', params.scenario_id);
      if (params.language) form.append('language', params.language);
      if (params.text) form.append('text', params.text);
      return request<TranscribeResponse>('/voice/transcribe', { method: 'POST', body: form });
    }
    return request<TranscribeResponse>('/voice/transcribe', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        provider: params.provider,
        scenario_id: params.scenario_id,
        text: params.text ?? null,
        language: params.language,
      }),
    });
  },

  extract: (transcript: string, scenario_id?: string) =>
    request<ExtractResponse>('/voice/extract', {
      method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ transcript, scenario_id }),
    }),

  clarify: (gaps: string[], answers: Record<string, unknown>, transcript?: string, extractions?: unknown[]) =>
    request<ClarifyResponse>('/voice/clarify', {
      method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ gaps, answers, transcript, extractions }),
    }),

  confirm: (payload: Record<string, unknown>) =>
    request<ConfirmResponse>('/voice/confirm', {
      method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload),
    }),

  saveDraft: (draft: DraftPayload) =>
    request<{ id: string; draft?: DraftPayload; saved_at?: string }>('/drafts', {
      method: 'POST', headers: jsonHeaders(), body: JSON.stringify(draft),
    }),

  listDrafts: () => request<DraftSummary[] | { drafts: DraftSummary[] }>('/drafts'),
  getDraft: (id: string) => request<DraftPayload & { id: string }>(`/drafts/${encodeURIComponent(id)}`),

  exportReport: async (report: PilotReport, format: 'json' = 'json') => {
    // Prefer backend export endpoint; caller can fallback to client-side download.
    return request<Blob | Record<string, unknown>>(`/export?format=${encodeURIComponent(format)}`, {
      method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ report, format }),
    } as any);
  },

  submitFeedback: (feedback: FeedbackPayload) =>
    request<{ status: string; id?: string; message?: string }>('/feedback', {
      method: 'POST', headers: jsonHeaders(), body: JSON.stringify(feedback),
    }),

  evaluationSummary: () => request<EvaluationSummary>('/evaluation/summary'),

  testScenarios: async (): Promise<TestScenario[]> => {
    const res = await request<any>('/scenarios');
    if (Array.isArray(res)) return res as TestScenario[];
    if (Array.isArray(res?.scenarios)) return res.scenarios as TestScenario[];
    if (Array.isArray(res?.items)) return res.items as TestScenario[];
    return [];
  },
};

export async function fetchExportBlob(report: PilotReport): Promise<Blob> {
  const res = await fetch(toUrl('/export?format=json'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ report, format: 'json' }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(text || `Export failed (${res.status})`, res.status);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const json = await res.json();
    return new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
  }
  return await res.blob();
}

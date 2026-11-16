import type { Extraction } from './types';

export const FIELD_LABELS: Record<string, { te: string; en: string }> = {
  report_date: { te: 'నివేదిక తేదీ', en: 'Report date' },
  centre_code: { te: 'కేంద్రం కోడ్', en: 'Centre code' },
  worker_code: { te: 'కార్మిక కోడ్', en: 'Worker code' },
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

export function labelFor(fieldId: string): string {
  return FIELD_LABELS[fieldId]?.en || FIELD_LABELS[fieldId]?.te || fieldId;
}

export function teLabelFor(fieldId: string): string | undefined {
  return FIELD_LABELS[fieldId]?.te;
}

export function displayValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'boolean') return value ? 'Yes / అవును' : 'No / కాదు';
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
    const v = raw.toLowerCase();
    return v === 'true' || v === 'yes' || v === 'అవును' || v === '1';
  }
  if (Array.isArray(sample)) {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return raw;
}

export function coerceByType(raw: string, type: string): unknown {
  if (type === 'integer' || type === 'number') {
    const n = Number(raw);
    return Number.isNaN(n) ? raw : n;
  }
  if (type === 'boolean') {
    const v = raw.toLowerCase();
    return v === 'true' || v === 'yes' || v === 'అవును' || v === '1';
  }
  if (type === 'enum_list' || type === 'array') {
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return raw;
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try { return JSON.stringify(err); } catch { return String(err); }
}

export function newIdempotencyKey(prefix = 'pilot'): string {
  let rand = '';
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) rand = crypto.randomUUID();
  } catch { /* ignore */ }
  if (!rand) rand = Math.random().toString(36).slice(2);
  return `${prefix}-${Date.now()}-${rand}`;
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function normalizeSpan(span: Extraction['source_span'], textLength: number): [number, number] | null {
  if (!span || !Array.isArray(span) || span.length < 2) return null;
  let [a, b] = span;
  if (typeof a !== 'number' || typeof b !== 'number' || Number.isNaN(a) || Number.isNaN(b)) return null;
  a = Math.max(0, Math.min(textLength, Math.floor(a)));
  b = Math.max(0, Math.min(textLength, Math.floor(b)));
  if (b < a) [a, b] = [b, a];
  if (a === b) return null;
  return [a, b];
}

export function getSpanText(text: string, span: Extraction['source_span']): string {
  const n = normalizeSpan(span, text.length);
  if (!n) return '';
  return text.slice(n[0], n[1]);
}

export type HighlightSegment = { text: string; highlight: boolean; fieldId?: string };

export function buildHighlightedSegments(text: string, extractions: Extraction[]): HighlightSegment[] {
  const spans: Array<{ start: number; end: number; fieldId: string }> = [];
  for (const ex of extractions) {
    const n = normalizeSpan(ex.source_span, text.length);
    if (n) spans.push({ start: n[0], end: n[1], fieldId: ex.field_id });
  }
  if (spans.length === 0) return [{ text, highlight: false }];
  spans.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Array<{ start: number; end: number; fieldId: string }> = [];
  for (const s of spans) {
    const last = merged[merged.length - 1];
    if (last && s.start <= last.end) {
      last.end = Math.max(last.end, s.end);
    } else {
      merged.push({ ...s });
    }
  }
  const out: HighlightSegment[] = [];
  let cursor = 0;
  for (const s of merged) {
    if (cursor < s.start) out.push({ text: text.slice(cursor, s.start), highlight: false });
    out.push({ text: text.slice(s.start, s.end), highlight: true, fieldId: s.fieldId });
    cursor = s.end;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), highlight: false });
  return out.filter((seg) => seg.text.length > 0);
}

export function detectBrowserSpeechRecognition(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function clampNumber(value: string, min: number, max: number): string {
  if (value.trim() === '') return '';
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return String(Math.max(min, Math.min(max, n)));
}

import { describe, expect, it } from 'vitest';
import { formatValidationMessages, isConfirmedSampleReport, isConfirmedSampleResponse } from './confirmation';

const validReport = {
  worker: { worker_code: 'W', centre_code: 'C' },
  report_date: '2026-11-17',
  fields: { children_present: 1 },
  confirmation: { confirmed_by: 'W', confirmed_at: '2026-11-17T00:00:00Z', explicit_confirmation: true },
  status: 'confirmed_sample',
} as any;

describe('isConfirmedSampleResponse', () => {
  it('accepts only fully valid confirmed sample response', () => {
    expect(isConfirmedSampleResponse({ report: validReport, validation: { valid: true, errors: [] }, draft_id: 'd1' } as any)).toBe(true);
  });

  it('rejects invalid response with HTTP-200-like payload (validation.valid=false)', () => {
    expect(isConfirmedSampleResponse({ report: { ...validReport, status: 'draft', confirmation: { ...validReport.confirmation, explicit_confirmation: false } }, validation: { valid: false, errors: ['x'] }, draft_id: 'd1' } as any)).toBe(false);
  });

  it('rejects missing validation data', () => {
    expect(isConfirmedSampleResponse({ report: validReport, draft_id: 'd1' } as any)).toBe(false);
    expect(isConfirmedSampleResponse({ report: validReport, validation: undefined } as any)).toBe(false);
  });

  it('rejects explicit_confirmation=false', () => {
    expect(isConfirmedSampleResponse({ report: { ...validReport, confirmation: { ...validReport.confirmation, explicit_confirmation: false } }, validation: { valid: true, errors: [] } } as any)).toBe(false);
  });

  it('rejects status=draft even if other fields look positive', () => {
    expect(isConfirmedSampleResponse({ report: { ...validReport, status: 'draft' }, validation: { valid: true, errors: [] } } as any)).toBe(false);
  });
});

describe('isConfirmedSampleReport', () => {
  it('accepts confirmed sample report only', () => {
    expect(isConfirmedSampleReport(validReport)).toBe(true);
    expect(isConfirmedSampleReport({ ...validReport, status: 'draft' })).toBe(false);
    expect(isConfirmedSampleReport({ ...validReport, confirmation: { ...validReport.confirmation, explicit_confirmation: false } })).toBe(false);
    expect(isConfirmedSampleReport(null)).toBe(false);
  });
});

describe('formatValidationMessages', () => {
  it('returns bilingual messages and preserves details', () => {
    const m = formatValidationMessages({ valid: false, errors: ['a: bad', 'b: missing'] } as any);
    expect(m.te.length).toBeGreaterThan(0);
    expect(m.en.toLowerCase()).toContain('not confirmed');
    expect(m.details).toEqual(['a: bad', 'b: missing']);
  });

  it('handles missing validation safely', () => {
    const m = formatValidationMessages(undefined);
    expect(Array.isArray(m.details)).toBe(true);
    expect(m.details.length).toBe(0);
  });
});

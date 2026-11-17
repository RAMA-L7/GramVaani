import type { ConfirmResponse, PilotReport, Validation } from './types';

export function isConfirmedSampleResponse(res: Partial<ConfirmResponse> | null | undefined): res is ConfirmResponse {
  const v = res?.validation as Validation | undefined;
  const r = res?.report as PilotReport | undefined;
  return (
    !!res &&
    !!v &&
    v.valid === true &&
    !!r &&
    r.status === 'confirmed_sample' &&
    r.confirmation?.explicit_confirmation === true
  );
}

export function isConfirmedSampleReport(report: Partial<PilotReport> | null | undefined): report is PilotReport {
  return (
    !!report &&
    report.status === 'confirmed_sample' &&
    report.confirmation?.explicit_confirmation === true
  );
}

export function formatValidationMessages(validation?: Partial<Validation> | null): { te: string; en: string; details: string[] } {
  const details = Array.isArray(validation?.errors)
    ? validation!.errors.filter((e): e is string => typeof e === 'string' && e.trim().length > 0)
    : [];
  return {
    te: 'నమూనా నివేదిక నిర్ధారించబడలేదు. దయచేసి లోపాలను సరిచేసి మళ్లీ ప్రయత్నించండి. (ఇది డ్రాఫ్ట్ మాత్రమే, నిర్ధారించబడలేదు.)',
    en: 'Sample report was not confirmed. Please fix the validation issues and try again. (Saved/kept as draft, not confirmed.)',
    details,
  };
}

export type ConfidenceSignalStatus = 'confirmed' | 'inferred' | 'missing' | 'blocked';

export interface ConfidenceSignal {
  id: string;
  label: string;
  status: ConfidenceSignalStatus;
  reason: string;
}

export interface ConfidenceSignalSummary {
  confidence: 'high' | 'medium' | 'low' | 'unknown';
  confirmed: ConfidenceSignal[];
  inferred: ConfidenceSignal[];
  missing: ConfidenceSignal[];
  blocked: ConfidenceSignal[];
  reasons: string[];
}

export function evaluateConfidenceSignals(signals: ConfidenceSignal[]): ConfidenceSignalSummary {
  const confirmed = signals.filter(signal => signal.status === 'confirmed');
  const inferred = signals.filter(signal => signal.status === 'inferred');
  const missing = signals.filter(signal => signal.status === 'missing');
  const blocked = signals.filter(signal => signal.status === 'blocked');
  const confidence = confidenceForSignals({ signals, confirmed, inferred, missing, blocked });

  return {
    confidence,
    confirmed,
    inferred,
    missing,
    blocked,
    reasons: reasonsForSignals({ confidence, confirmed, inferred, missing, blocked }),
  };
}

function confidenceForSignals(input: {
  signals: ConfidenceSignal[];
  confirmed: ConfidenceSignal[];
  inferred: ConfidenceSignal[];
  missing: ConfidenceSignal[];
  blocked: ConfidenceSignal[];
}): ConfidenceSignalSummary['confidence'] {
  if (input.signals.length === 0) return 'unknown';
  if (input.blocked.length > 0) return 'low';
  if (input.confirmed.length >= 4 && input.missing.length === 0) return 'high';
  if (input.confirmed.length >= 2 && input.missing.length <= 2) return 'medium';
  return 'low';
}

function reasonsForSignals(input: {
  confidence: ConfidenceSignalSummary['confidence'];
  confirmed: ConfidenceSignal[];
  inferred: ConfidenceSignal[];
  missing: ConfidenceSignal[];
  blocked: ConfidenceSignal[];
}): string[] {
  if (input.confidence === 'unknown') return ['no practical confidence signals were supplied'];

  const reasons: string[] = [];
  if (input.confirmed.length > 0) {
    reasons.push(`confirmed: ${input.confirmed.map(signal => signal.label).join(', ')}`);
  }
  if (input.inferred.length > 0) {
    reasons.push(`inferred: ${input.inferred.map(signal => signal.label).join(', ')}`);
  }
  if (input.missing.length > 0) {
    reasons.push(`missing: ${input.missing.map(signal => signal.label).join(', ')}`);
  }
  if (input.blocked.length > 0) {
    reasons.push(`blocked: ${input.blocked.map(signal => signal.label).join(', ')}`);
  }
  return reasons;
}

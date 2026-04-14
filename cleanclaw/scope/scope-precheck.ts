import type { ApprovedPlanContext, ChangeCategory, InflectionPoint, ScopeAction } from './scope-rules.js';
import { CUMULATIVE_LIMIT } from './scope-rules.js';

export interface PrecheckInput {
  filename: string;
  diff: string;               // unified diff of the proposed change
  cumulativeChangeCount: number;
  isIterationStart?: boolean;
}

export interface PrecheckResult {
  resolved: boolean;
  action?: ScopeAction;
  category?: ChangeCategory;
  inflectionPoint?: InflectionPoint;
  rationale: string;
}

const INFRA_FILE_PATTERN = /^(package\.json|package-lock\.json|tsconfig.*|\.env.*|docker-compose.*)$/;
const NEW_IMPORT_PATTERN = /^\+\s*(import\s|require\()/m;
const NEW_PACKAGE_PATTERN = /^\+\s*["']\w/m;  // new entry in dependencies block

export function precheck(input: PrecheckInput, ctx: ApprovedPlanContext): PrecheckResult {
  const { filename, diff, cumulativeChangeCount, isIterationStart } = input;
  const basename = filename.split(/[\\/]/).pop() ?? filename;

  // ── Inflection: iteration start ───────────────────────────────────────────
  if (isIterationStart) {
    return { resolved: true, action: 'check-silent', inflectionPoint: 'iteration-start', rationale: 'iteration boundary — coarse sanity check' };
  }

  // ── Inflection: cumulative threshold ──────────────────────────────────────
  if (cumulativeChangeCount >= CUMULATIVE_LIMIT) {
    return { resolved: true, action: 'halt-confirm', inflectionPoint: 'cumulative-threshold', rationale: `${cumulativeChangeCount} changes applied in this iteration — threshold reached` };
  }

  // ── Inflection: file not in approved plan ─────────────────────────────────
  if (!ctx.approvedFiles.includes(filename)) {
    return { resolved: true, action: 'halt-confirm', inflectionPoint: 'out-of-plan-file', rationale: `"${filename}" is not in the approved file list` };
  }

  // ── Halt: infra/config file not in plan ───────────────────────────────────
  if (INFRA_FILE_PATTERN.test(basename)) {
    return { resolved: true, action: 'halt-confirm', category: 'new-dependency', rationale: `"${basename}" is a config/infra file — changes require explicit approval` };
  }

  // ── Halt: new external import detected ────────────────────────────────────
  if (NEW_IMPORT_PATTERN.test(diff) || NEW_PACKAGE_PATTERN.test(diff)) {
    return { resolved: true, action: 'halt-confirm', category: 'new-dependency', rationale: 'diff introduces a new import or package reference' };
  }

  // ── Proceed: whitespace / comment / formatting only ───────────────────────
  const addedLines = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++'));
  const meaningfulLines = addedLines.filter(l => {
    const trimmed = l.slice(1).trim();
    return trimmed.length > 0 && !trimmed.startsWith('//') && !trimmed.startsWith('*') && !trimmed.startsWith('#');
  });
  if (meaningfulLines.length === 0) {
    return { resolved: true, action: 'proceed', category: 'structural', rationale: 'whitespace, comment, or formatting change only' };
  }

  // ── Proceed: pure declaration (class/interface/enum/property, no logic) ───
  const hasLogic = /^\+.*(if\s*\(|for\s*\(|while\s*\(|switch\s*\(|=>\s*\{|return\s+\w)/.test(diff);
  const hasDeclaration = /^\+.*(class\s+\w|interface\s+\w|enum\s+\w|\w+\s*[:=]\s*\w+\s*;)/.test(diff);
  if (hasDeclaration && !hasLogic) {
    return { resolved: true, action: 'proceed', category: 'structural', rationale: 'pure declaration with no logic body' };
  }

  // ── Check-silent: new control flow in approved file ───────────────────────
  if (hasLogic) {
    return { resolved: true, action: 'check-silent', category: 'behavioural', rationale: 'new control flow in approved file — logged silently' };
  }

  // ── Ambiguous: pass to LLM classifier ────────────────────────────────────
  return { resolved: false, rationale: 'change pattern not deterministically classifiable — requires LLM review' };
}

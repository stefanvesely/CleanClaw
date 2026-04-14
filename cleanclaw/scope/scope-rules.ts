// ─── Change categories (lowest → highest suspicion) ───────────────────────────

export type ChangeCategory =
  | 'structural'      // class/property/method signature → proceed
  | 'behavioural'     // new logic, conditions, data flow → check-silent
  | 'ui-addition'     // new component, button, route → halt-confirm
  | 'new-dependency'  // new import, new package → halt-confirm
  | 'cross-cutting'   // file not in approved plan → halt-confirm
  | 'unmapped';       // no parent step identifiable → halt-confirm

// ─── Actions ──────────────────────────────────────────────────────────────────

export type ScopeAction = 'proceed' | 'check-silent' | 'halt-confirm';

// ─── Inflection points (checked before per-change rules) ──────────────────────

export type InflectionPoint =
  | 'iteration-start'       // beginning of LLM-generated iteration → check-silent
  | 'out-of-plan-file'      // file not in approvedFiles → halt-confirm
  | 'cumulative-threshold'  // 5+ changes in one iteration → halt-confirm
  | 'no-parent-step';       // classifier returned unmapped → halt-confirm

// ─── Rule table ───────────────────────────────────────────────────────────────

export const CATEGORY_ACTIONS: Record<ChangeCategory, ScopeAction> = {
  structural:       'proceed',
  behavioural:      'check-silent',
  'ui-addition':    'halt-confirm',
  'new-dependency': 'halt-confirm',
  'cross-cutting':  'halt-confirm',
  unmapped:         'halt-confirm',
};

export const INFLECTION_ACTIONS: Record<InflectionPoint, ScopeAction> = {
  'iteration-start':      'check-silent',
  'out-of-plan-file':     'halt-confirm',
  'cumulative-threshold': 'halt-confirm',
  'no-parent-step':       'halt-confirm',
};

export const CUMULATIVE_LIMIT = 5;

// ─── Context passed to every scope check ──────────────────────────────────────

export interface ApprovedPlanContext {
  approvedFiles: string[];
  taskDescription: string;
  planContent: string;
}

// ─── Decision returned by scope-guard ─────────────────────────────────────────

export interface ScopeDecision {
  action: ScopeAction;
  category?: ChangeCategory;
  inflectionPoint?: InflectionPoint;
  rationale: string;
  ruleId: string;
}

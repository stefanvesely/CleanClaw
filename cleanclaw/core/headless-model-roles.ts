export type HeadlessModelRoleName = 'coder' | 'reviewer' | 'reviewer-planner';

export interface HeadlessModelRole {
  role: HeadlessModelRoleName;
  model: string;
}

export interface HeadlessModelRoleValidation {
  valid: boolean;
  missing: string[];
}

export function validateHeadlessModelRoles(roles: HeadlessModelRole[]): HeadlessModelRoleValidation {
  const missing: string[] = [];
  const hasCoder = roles.some(role => role.role === 'coder' && role.model.trim());
  const hasReviewer = roles.some(role => (
    role.role === 'reviewer' || role.role === 'reviewer-planner'
  ) && role.model.trim());

  if (!hasCoder) missing.push('coder model role');
  if (!hasReviewer) missing.push('reviewer/planner model role');

  return {
    valid: missing.length === 0,
    missing,
  };
}

import path from "node:path";

export interface MethodRow {
  method_name: string;
  signature: string;
  output: string;
  filename: string;
  full_path: string;
  metadata: string;
  algorithm: string;
}

export interface MiscRow {
  filename: string;
  full_path: string;
  purpose: string;
  related_layer: string;
}

// Per-extension patterns: each yields (method_name, signature, output)
const _PATTERNS: Record<string, RegExp> = {
  ".ts":  /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*(\([^)]*\))\s*(?::\s*([^{]+?))?(?:\s*\{|$)/gm,
  ".tsx": /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*(\([^)]*\))\s*(?::\s*([^{]+?))?(?:\s*\{|$)/gm,
  ".cs":  /(?:public|private|protected|internal|static|async|override|virtual)\s+(?:\w+[\w<>\[\]?,\s]*)\s+(\w+)\s*(\([^)]*\))\s*(?:where[^{]*)?\{/gm,
  ".py":  /^\s*(?:async\s+)?def\s+(\w+)\s*(\([^)]*\))\s*(?:->\s*([^:]+))?:/gm,
  ".php": /(?:public|private|protected|static|\s)+function\s+(\w+)\s*(\([^)]*\))/gm,
};

const _CODE_EXTENSIONS = new Set(Object.keys(_PATTERNS));

export function extractMethods(filePath: string, content: string): MethodRow[] {
  const ext = path.extname(filePath).toLowerCase();
  const patternTemplate = _PATTERNS[ext];
  if (!patternTemplate) return [];

  // Re-create the regex with lastIndex reset for each call
  const pattern = new RegExp(patternTemplate.source, patternTemplate.flags);
  const rows: MethodRow[] = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(content)) !== null) {
    const methodName = match[1].trim();
    const sig = match[2] ? match[2].trim() : "";
    const output = match[3] ? match[3].trim() : "";
    const signature = sig ? `${methodName}${sig}` : methodName;
    rows.push({
      method_name: methodName,
      signature,
      output,
      filename: path.basename(filePath),
      full_path: filePath,
      metadata: "",
      algorithm: "",
    });
  }

  return rows;
}

export function isCodeFile(filePath: string): boolean {
  return _CODE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function embedTextForMethod(row: MethodRow): string {
  const parts = [row.method_name, row.signature];
  if (row.output) parts.push(`returns ${row.output}`);
  parts.push(row.full_path);
  return parts.join(" | ");
}

export function embedTextForMisc(row: MiscRow): string {
  return `${row.filename} | ${row.purpose} | ${row.related_layer}`;
}

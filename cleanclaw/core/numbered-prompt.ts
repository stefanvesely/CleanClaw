export interface NumberedPromptOption {
  id: string;
  label: string;
  description?: string;
  recommended?: boolean;
}

export type NumberedPromptSelection =
  | { kind: 'option'; option: NumberedPromptOption }
  | { kind: 'control'; control: 'back' | 'cancel' | 'exit' }
  | { kind: 'natural-language'; text: string }
  | { kind: 'invalid'; reason: string };

export interface NumberedPromptConfig {
  question: string;
  options: NumberedPromptOption[];
  defaultId?: string;
  allowNaturalLanguage?: boolean;
}

export function formatNumberedPrompt(config: NumberedPromptConfig): string {
  const lines = [
    config.question,
    '',
    ...config.options.map((option, index) => {
      const suffix = option.recommended ? ' (recommended)' : '';
      const base = `${index + 1}. ${option.label}${suffix}`;
      return option.description ? `${base}\n   ${option.description}` : base;
    }),
    '',
    'Type a number, option id, back, cancel, or exit.',
  ];

  if (config.defaultId) {
    const defaultOption = config.options.find(option => option.id === config.defaultId);
    if (defaultOption) {
      lines.push(`Press Enter for: ${defaultOption.label}`);
    }
  }

  if (config.allowNaturalLanguage) {
    lines.push('You can also type what you want in plain language.');
  }

  return lines.join('\n');
}

export function parseNumberedPromptSelection(
  input: string,
  config: NumberedPromptConfig,
): NumberedPromptSelection {
  const raw = input.trim();

  if (!raw) {
    if (!config.defaultId) {
      return { kind: 'invalid', reason: 'No default option is configured.' };
    }

    const defaultOption = config.options.find(option => option.id === config.defaultId);
    if (!defaultOption) {
      return { kind: 'invalid', reason: `Default option is missing: ${config.defaultId}` };
    }

    return { kind: 'option', option: defaultOption };
  }

  const control = parseControl(raw);
  if (control) return { kind: 'control', control };

  const number = Number(raw);
  if (Number.isInteger(number)) {
    const option = config.options[number - 1];
    if (option) return { kind: 'option', option };
    return { kind: 'invalid', reason: `Option number is out of range: ${raw}` };
  }

  const byId = config.options.find(option => option.id.toLowerCase() === raw.toLowerCase());
  if (byId) return { kind: 'option', option: byId };

  if (config.allowNaturalLanguage) {
    return { kind: 'natural-language', text: raw };
  }

  return { kind: 'invalid', reason: `Unknown option: ${raw}` };
}

function parseControl(value: string): 'back' | 'cancel' | 'exit' | null {
  const normalized = value.toLowerCase();
  if (normalized === 'back' || normalized === 'b') return 'back';
  if (normalized === 'cancel' || normalized === 'c') return 'cancel';
  if (normalized === 'exit' || normalized === 'quit' || normalized === 'q') return 'exit';
  return null;
}

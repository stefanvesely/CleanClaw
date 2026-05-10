import { SECRET_PATTERNS } from '../../src/lib/secret-patterns.js';

const CREDENTIAL_ASSIGNMENT_PATTERN =
  /(NVIDIA_API_KEY|OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|COMPATIBLE_API_KEY|COMPATIBLE_ANTHROPIC_API_KEY|BRAVE_API_KEY|SLACK_BOT_TOKEN|SLACK_APP_TOKEN|DISCORD_BOT_TOKEN|TELEGRAM_BOT_TOKEN|API_KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL)=\S+/gi;

const BEARER_PATTERN = /(Bearer\s+)\S+/gi;
const TELEGRAM_BOT_PATH_PATTERN = /\/bot[^/\s]+/g;

export function redactPlanSecrets(text: string): string {
  let result = text
    .replace(CREDENTIAL_ASSIGNMENT_PATTERN, '$1=<REDACTED>')
    .replace(BEARER_PATTERN, '$1<REDACTED>')
    .replace(TELEGRAM_BOT_PATH_PATTERN, '/bot<REDACTED>');

  for (const pattern of SECRET_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, '<REDACTED>');
  }

  return result;
}

export function redactLineContent<T extends { content: string }>(line: T): T {
  return {
    ...line,
    content: redactPlanSecrets(line.content),
  };
}

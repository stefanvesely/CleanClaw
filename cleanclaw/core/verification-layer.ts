import readline from 'readline';
import type { ProposedChange } from './language-agent.js';
import type { DiffCapture } from '../plans/diff-capture.js';
import { createConsoleLogger, type CleanClawLogger } from './logger.js';

const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const RULE = '-----------------------------------------';

function readLine(prompt: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function promptApproval(
  proposed: ProposedChange,
  before: DiffCapture,
  logger: CleanClawLogger = createConsoleLogger(),
): Promise<{ approved: boolean; why: string }> {
  logger.info(`\n${RULE}`);
  logger.info('PROPOSED CHANGE');
  logger.info(RULE);
  logger.info(`File: ${proposed.filename}${before.isNewFile ? ' (NEW FILE)' : ''}`);

  logger.info(`\n${RED}BEFORE:${RESET}`);
  if (before.isNewFile || before.lines.length === 0) {
    logger.info('  (file does not exist)');
  } else {
    before.lines.forEach(l => logger.info(`  ${l.lineNumber}: ${l.content}`));
  }

  logger.info(`\n${RED}AFTER:${RESET}`);
  proposed.afterLines.forEach(l => logger.info(`  ${l.lineNumber}: ${l.content}`));

  logger.info(`\n${RED}Explanation:${RESET} ${proposed.explanation}`);
  logger.info(RULE);

  const answer = await readLine('Approve? [y]es / [n]o: ');

  if (answer.toLowerCase() !== 'y') {
    return { approved: false, why: '[user] rejected' };
  }

  const why = await readLine('Why are you approving? (Enter to use agent explanation): ');
  return { approved: true, why: why ? `[user] ${why}` : `[agent] ${proposed.explanation}` };
}

export async function promptApprovalForFile(
  proposals: ProposedChange[],
  befores: DiffCapture[],
  logger: CleanClawLogger = createConsoleLogger(),
): Promise<{ approved: boolean; why: string }> {
  logger.info(`\n${RULE}`);
  logger.info(`FILE: ${proposals[0].filename} - ${proposals.length} change(s)`);
  logger.info(RULE);

  for (let i = 0; i < proposals.length; i++) {
    const proposed = proposals[i];
    const before = befores[i];
    logger.info(`\nChange ${i + 1}:`);
    logger.info(`${RED}BEFORE:${RESET}`);
    if (before.isNewFile || before.lines.length === 0) {
      logger.info('  (file does not exist)');
    } else {
      before.lines.forEach(l => logger.info(`  ${l.lineNumber}: ${l.content}`));
    }
    logger.info(`\n${RED}AFTER:${RESET}`);
    proposed.afterLines.forEach(l => logger.info(`  ${l.lineNumber}: ${l.content}`));
    logger.info(`\n${RED}Explanation:${RESET} ${proposed.explanation}`);
  }

  logger.info(RULE);
  const answer = await readLine(`Approve all ${proposals.length} change(s) to ${proposals[0].filename}? [y]es / [n]o: `);
  if (answer.toLowerCase() !== 'y') {
    return { approved: false, why: '[user] rejected' };
  }
  const why = await readLine('Why are you approving? (Enter to use agent explanation): ');
  const explanation = proposals.map(p => p.explanation).join('; ');
  return { approved: true, why: why ? `[user] ${why}` : `[agent] ${explanation}` };
}

export function autoApprove(
  proposed: ProposedChange,
  logger: CleanClawLogger = createConsoleLogger(),
): { approved: boolean; why: string } {
  logger.info(`[headless] auto-approved: ${proposed.filename}`);
  return { approved: true, why: `[agent] ${proposed.explanation}` };
}

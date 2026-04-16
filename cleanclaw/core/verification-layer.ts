import readline from 'readline';
import type { ProposedChange } from './language-agent.js';
import type { DiffCapture } from '../plans/diff-capture.js';

const RED = '\x1b[31m';
const RESET = '\x1b[0m';

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
): Promise<{ approved: boolean; why: string }> {
  console.log('\n─────────────────────────────────────────');
  console.log('PROPOSED CHANGE');
  console.log('─────────────────────────────────────────');
  console.log(`File: ${proposed.filename}${before.isNewFile ? ' (NEW FILE)' : ''}`);

  console.log(`\n${RED}BEFORE:${RESET}`);
  if (before.isNewFile || before.lines.length === 0) {
    console.log('  (file does not exist)');
  } else {
    before.lines.forEach(l => console.log(`  ${l.lineNumber}: ${l.content}`));
  }

  console.log(`\n${RED}AFTER:${RESET}`);
  proposed.afterLines.forEach(l => console.log(`  ${l.lineNumber}: ${l.content}`));

  console.log(`\n${RED}Explanation:${RESET} ${proposed.explanation}`);
  console.log('─────────────────────────────────────────');

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
): Promise<{ approved: boolean; why: string }> {
  console.log('\n─────────────────────────────────────────');
  console.log(`FILE: ${proposals[0].filename} — ${proposals.length} change(s)`);
  console.log('─────────────────────────────────────────');

  for (let i = 0; i < proposals.length; i++) {
    const proposed = proposals[i];
    const before = befores[i];
    console.log(`\nChange ${i + 1}:`);
    console.log(`${RED}BEFORE:${RESET}`);
    if (before.isNewFile || before.lines.length === 0) {
      console.log('  (file does not exist)');
    } else {
      before.lines.forEach(l => console.log(`  ${l.lineNumber}: ${l.content}`));
    }
    console.log(`\n${RED}AFTER:${RESET}`);
    proposed.afterLines.forEach(l => console.log(`  ${l.lineNumber}: ${l.content}`));
    console.log(`\n${RED}Explanation:${RESET} ${proposed.explanation}`);
  }

  console.log('─────────────────────────────────────────');
  const answer = await readLine(`Approve all ${proposals.length} change(s) to ${proposals[0].filename}? [y]es / [n]o: `);
  if (answer.toLowerCase() !== 'y') {
    return { approved: false, why: '[user] rejected' };
  }
  const why = await readLine('Why are you approving? (Enter to use agent explanation): ');
  const explanation = proposals.map(p => p.explanation).join('; ');
  return { approved: true, why: why ? `[user] ${why}` : `[agent] ${explanation}` };
}

export function autoApprove(proposed: ProposedChange): { approved: boolean; why: string } {
  console.log(`[headless] auto-approved: ${proposed.filename}`);
  return { approved: true, why: `[agent] ${proposed.explanation}` };
}

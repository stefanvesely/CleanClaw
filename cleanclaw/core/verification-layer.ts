import readline from 'readline';
import type { ProposedChange } from './language-agent.js';
import type { DiffCapture } from '../plans/diff-capture.js';

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

  console.log('\nBEFORE:');
  if (before.isNewFile || before.lines.length === 0) {
    console.log('  (file does not exist)');
  } else {
    before.lines.forEach(l => console.log(`  ${l.lineNumber}: ${l.content}`));
  }

  console.log('\nAFTER:');
  proposed.afterLines.forEach(l => console.log(`  ${l.lineNumber}: ${l.content}`));

  console.log(`\nExplanation: ${proposed.explanation}`);
  console.log('─────────────────────────────────────────');

  const answer = await readLine('Approve? [y]es / [n]o: ');

  if (answer.toLowerCase() !== 'y') {
    return { approved: false, why: 'rejected by developer' };
  }

  const why = await readLine('Why are you approving? (Enter to use agent explanation): ');
  return { approved: true, why: why || proposed.explanation };
}

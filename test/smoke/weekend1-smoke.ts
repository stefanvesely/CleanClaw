import { AnthropicBridge } from '../../cleanclaw/bridges/anthropic-bridge.js';
import { getConfig } from '../../cleanclaw/core/config-loader.js';

const config = getConfig();

if (!config.anthropic?.apiKey) {
  throw new Error('No Anthropic API key in config');
}

const bridge = new AnthropicBridge(config.anthropic.apiKey, config.anthropic.model);

const response = await bridge.send([
  { role: 'user', content: 'Respond with exactly the word WORKING and nothing else.' }
]);

if (response.content.trim() === 'WORKING') {
  console.log('Weekend 1 milestone: PASS');
  console.log(`Model: ${response.model}`);
  console.log(`Tokens used: ${response.usage.inputTokens} in, ${response.usage.outputTokens} out`);
} else {
  console.error('FAIL — unexpected response:', response.content);
  process.exit(1);
}

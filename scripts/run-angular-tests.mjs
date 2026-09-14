import { mkdir, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const resultPath = '.sflow/results/angular-tests.json';
const child = spawn('npx', [
  '--no-install',
  'ng',
  'test',
  '--watch=false',
  '--browsers=ChromeHeadless',
  '--no-progress',
], { stdio: ['ignore', 'pipe', 'pipe'] });

let output = '';
child.stdout.on('data', chunk => {
  const text = chunk.toString();
  output += text;
  process.stdout.write(text);
});
child.stderr.on('data', chunk => {
  const text = chunk.toString();
  output += text;
  process.stderr.write(text);
});

child.on('close', async exitCode => {
  const totalMatch = output.match(/TOTAL:\s+(\d+)\s+SUCCESS/);
  const discovered = totalMatch ? Number(totalMatch[1]) : 0;
  const passed = exitCode === 0 ? discovered : 0;
  const failed = exitCode === 0 ? 0 : discovered;
  await mkdir('.sflow/results', { recursive: true });
  await writeFile(resultPath, JSON.stringify({
    adapter: 'sflow-test-result-v1',
    tests: { discovered, passed, failed, skipped: 0 },
  }, null, 2));
  process.exit(exitCode ?? 1);
});
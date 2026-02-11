#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['components/domain', 'app'];
const FORBIDDEN = [
  { pattern: /dangerouslySetInnerHTML/, reason: 'runtime HTML/style injection' },
  { pattern: /\blocation\.reload\s*\(/, reason: 'hard page reload side-effect' },
  { pattern: /\balert\s*\(/, reason: 'global blocking browser alert side-effect' },
];

function getCandidateFiles() {
  const pattern = TARGET_DIRS.map((dir) => `${dir}/**/*.{ts,tsx}`).join(' ');
  try {
    const output = execSync(`rg --files ${pattern}`, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((file) => `${ROOT}/${file}`);
  } catch {
    return [];
  }
}

const candidates = getCandidateFiles();
const violations = [];

for (const filePath of candidates) {
  const source = readFileSync(filePath, 'utf8');
  for (const rule of FORBIDDEN) {
    if (rule.pattern.test(source)) {
      violations.push({
        filePath: relative(ROOT, filePath),
        pattern: rule.pattern.toString(),
        reason: rule.reason,
      });
    }
  }
}

if (violations.length > 0) {
  console.error('Architecture guard failed. Forbidden patterns found:');
  violations.forEach((violation) => {
    console.error(`- ${violation.filePath} -> ${violation.pattern} (${violation.reason})`);
  });
  process.exit(1);
}

console.log('Architecture guard passed.');

#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

const REQUIRED_DOCS = [
  'docs/README.md',
  'AGENTS.md',
  'docs/engineering/AI_FEATURE_CONVENTIONS.md',
  'docs/engineering/REPO_ARCHITECTURE.md',
  'docs/engineering/ARCHITECTURE_CHANGELOG.md',
];

const FORBIDDEN_PATTERNS = [
  { pattern: /file:\/\//, reason: 'absolute local file links are not portable' },
  { pattern: /\/Users\//, reason: 'machine-specific absolute paths are not portable' },
  { pattern: /\bTempoDine\b/i, reason: 'legacy project naming should not reappear' },
];

function getMarkdownFiles() {
  const output = execSync("rg --files -g '*.md'", {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

const failures = [];

for (const docPath of REQUIRED_DOCS) {
  if (!existsSync(join(ROOT, docPath))) {
    failures.push(`Missing required doc: ${docPath}`);
  }
}

const markdownFiles = getMarkdownFiles();

for (const file of markdownFiles) {
  const content = readFileSync(join(ROOT, file), 'utf8');
  for (const rule of FORBIDDEN_PATTERNS) {
    if (rule.pattern.test(content)) {
      failures.push(`${file}: ${rule.reason} (${rule.pattern})`);
    }
  }
}

if (existsSync(join(ROOT, 'AGENTS.md'))) {
  const agents = readFileSync(join(ROOT, 'AGENTS.md'), 'utf8');
  if (!agents.includes('docs/README.md')) {
    failures.push('AGENTS.md must reference docs/README.md as documentation index.');
  }
}

if (failures.length > 0) {
  console.error('Documentation guard failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Documentation guard passed.');

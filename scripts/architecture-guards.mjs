#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { relative } from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['components/domain', 'app'];
const FORBIDDEN = [
  { pattern: /dangerouslySetInnerHTML/, reason: 'runtime HTML/style injection' },
  { pattern: /\blocation\.reload\s*\(/, reason: 'hard page reload side-effect' },
  { pattern: /\balert\s*\(/, reason: 'global blocking browser alert side-effect' },
];

function getCandidateFiles() {
  const files = [];
  for (const dir of TARGET_DIRS) {
    walkTsFiles(`${ROOT}/${dir}`, files);
  }
  return files;
}

function walkTsFiles(dir, files) {
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = `${dir}/${entry}`;
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walkTsFiles(fullPath, files);
      continue;
    }
    if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      files.push(fullPath);
    }
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

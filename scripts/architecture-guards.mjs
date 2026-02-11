#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['components/domain', 'app'];
const FORBIDDEN = [
  { pattern: /dangerouslySetInnerHTML/g, reason: 'runtime HTML/style injection' },
  { pattern: /\blocation\.reload\s*\(/g, reason: 'hard page reload side-effect' },
  { pattern: /\balert\s*\(/g, reason: 'global blocking browser alert side-effect' },
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath, files);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }
  return files;
}

const candidates = TARGET_DIRS.flatMap((relativeDir) => walk(join(ROOT, relativeDir)));
const violations = [];

for (const filePath of candidates) {
  const source = readFileSync(filePath, 'utf8');
  for (const rule of FORBIDDEN) {
    if (rule.pattern.test(source)) {
      violations.push({
        filePath: filePath.replace(`${ROOT}/`, ''),
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

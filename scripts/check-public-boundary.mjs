#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PUBLIC_TOP_LEVEL_DIRECTORIES = new Set([
  '.github',
  'content',
  'docs',
  'messages',
  'public',
  'scripts',
  'src',
  'tests',
]);

const BLOCKED_COMPONENTS = new Map([
  ['.agent', 'agent or workspace'],
  ['.agents', 'agent or workspace'],
  ['agent', 'agent or workspace'],
  ['agents', 'agent or workspace'],
  ['agent-ctx', 'agent or workspace'],
  ['agent-workspace', 'agent or workspace'],
  ['.claude', 'agent or workspace'],
  ['.codex', 'agent or workspace'],
  ['.hermes', 'agent or workspace'],
  ['.skills', 'skill or runtime instruction'],
  ['skill', 'skill or runtime instruction'],
  ['skills', 'skill or runtime instruction'],
  ['.runtime', 'skill or runtime instruction'],
  ['instructions', 'skill or runtime instruction'],
  ['prompts', 'skill or runtime instruction'],
  ['evidence', 'evidence or execution artifact'],
  ['execution', 'evidence or execution artifact'],
  ['executions', 'evidence or execution artifact'],
  ['artifact', 'evidence or execution artifact'],
  ['artifacts', 'evidence or execution artifact'],
  ['handoff', 'evidence or execution artifact'],
  ['handoffs', 'evidence or execution artifact'],
  ['receipt', 'evidence or execution artifact'],
  ['receipts', 'evidence or execution artifact'],
  ['golden', 'benchmark or evaluation'],
]);

const BLOCKED_MARKERS = [
  ['benchmark', 'benchmark or evaluation'],
  ['holdout', 'benchmark or evaluation'],
  ['gold', 'benchmark or evaluation'],
  ['golden', 'benchmark or evaluation'],
  ['private', 'private or internal'],
  ['internal', 'private or internal'],
  ['confidential', 'private or internal'],
  ['restricted', 'private or internal'],
  ['secret', 'private or internal'],
];

const BLOCKED_FILE_NAMES = new Map([
  ['agent.md', 'agent instruction'],
  ['agents.md', 'agent instruction'],
  ['skill.md', 'skill instruction'],
]);

const ARCHIVE_SUFFIXES = ['.zip', '.tar', '.tar.gz', '.tgz', '.7z', '.rar'];

function hasMarker(component, marker) {
  return component === marker ||
    component.startsWith(`${marker}-`) ||
    component.startsWith(`${marker}_`) ||
    component.startsWith(`${marker}.`);
}

function componentViolation(component, isLastComponent) {
  const lowerComponent = component.toLowerCase();
  const exactReason = BLOCKED_COMPONENTS.get(lowerComponent);
  if (exactReason) {
    return `blocked ${exactReason} path component "${component}"`;
  }

  const fileReason = BLOCKED_FILE_NAMES.get(lowerComponent);
  if (isLastComponent && fileReason) {
    return `blocked ${fileReason} file "${component}"`;
  }

  for (const [marker, reason] of BLOCKED_MARKERS) {
    if (hasMarker(lowerComponent, marker)) {
      return `blocked ${reason} path marker "${component}"`;
    }
  }

  if (hasMarker(lowerComponent, 'runtime')) {
    return `blocked skill or runtime instruction path marker "${component}"`;
  }

  return null;
}

function environmentViolation(component, isLastComponent) {
  const lowerComponent = component.toLowerCase();
  if (lowerComponent === '.env.example') {
    return isLastComponent ? null : `unsafe environment-secret path component "${component}"`;
  }
  if (lowerComponent === '.env' || lowerComponent.startsWith('.env.')) {
    return `unsafe environment-secret path component "${component}"`;
  }
  return null;
}

export function findPathViolation(path) {
  const components = path.split('/');
  const lowerPath = path.toLowerCase();

  if (ARCHIVE_SUFFIXES.some((suffix) => lowerPath.endsWith(suffix))) {
    return `unsafe archive bundle "${path}"`;
  }

  for (let index = 0; index < components.length; index += 1) {
    const environmentPathViolation = environmentViolation(
      components[index],
      index === components.length - 1,
    );
    if (environmentPathViolation) {
      return environmentPathViolation;
    }

    const violation = componentViolation(components[index], index === components.length - 1);
    if (violation) {
      return violation;
    }
  }

  if (components.length > 1 && !PUBLIC_TOP_LEVEL_DIRECTORIES.has(components[0])) {
    return `unknown top-level directory "${components[0]}"`;
  }

  return null;
}

export function readTrackedPaths(cwd = process.cwd()) {
  return execFileSync('git', ['ls-files', '-z'], { cwd, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);
}

export function findTrackedPathViolations(cwd = process.cwd()) {
  return readTrackedPaths(cwd)
    .flatMap((path) => {
      const violation = findPathViolation(path);
      return violation ? [`${path}: ${violation}`] : [];
    });
}

export function main(cwd = process.cwd()) {
  const findings = findTrackedPathViolations(cwd);
  if (findings.length > 0) {
    console.error('Public boundary guard failed:');
    for (const finding of findings) {
      console.error(`- ${finding}`);
    }
    return 1;
  }

  console.log('Public boundary guard passed.');
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  process.exitCode = main();
}

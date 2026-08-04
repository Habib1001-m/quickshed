/**
 * F1 — Backup Import trust boundary.
 *
 * Pure, storage-agnostic parsing, validation, and transactional apply for
 * QuickShed backup files. No React, no `window`: callers inject a
 * `StorageLike` (the component passes `window.localStorage`, tests pass a
 * fake), so every code path is unit-testable in Node without a browser.
 *
 * Contract / compatibility policy
 * -------------------------------
 * Import only touches the app's permitted `quickshed-*` storage namespace.
 * Each known key has a zod validator grounded in the reader that consumes it,
 * so a crafted, stale, or malformed backup can never reach app state.
 *
 * - Unknown `quickshed-*` keys (e.g. from a different app version) reject the
 *   ENTIRE import. We never partially import, and we never silently write a
 *   structure this codebase does not understand. The user gets a clear error.
 * - Non-`quickshed-*` keys are ignored (we only ever write our namespace).
 * - Scalar keys (`locale`, accent color, boolean flags) are normalized back to
 *   the exact raw-string form the app stores, so a re-export after import is
 *   byte-stable.
 * - Writes are transactional: every affected key is snapshotted first and
 *   restored to its prior value/existence if any write throws.
 */
import {
  localeSchema,
  accentColorIdSchema as accentColorSchema,
  flagSchema,
  stringArraySchema,
  usageSchema,
  collectionsSchema,
  toolHistorySchema as historySchema,
  ratingsSchema,
  habitsSchema,
  notesSchema,
  urlShortenerSchema,
} from '@/lib/storage-shapes';
import type { ZodType } from 'zod';

// The per-key validators below are now sourced from the shared
// `src/lib/storage-shapes.ts` module so the import trust boundary and the
// runtime readers can never drift apart. The element-level shape is the
// shared contract; here it is wrapped for strict wholesale validation.

// ─── Canonical storage keys (the permitted namespace) ────────────────

export const KNOWN_STORAGE_KEYS = [
  'quickshed-locale',
  'quickshed-favorites',
  'quickshed-recent',
  'quickshed-usage',
  'quickshed-collections',
  'quickshed-compare',
  'quickshed-tool-history',
  'quickshed-accent-color',
  'quickshed-tool-ratings',
  'quickshed-banner-dismissed',
  'quickshed-habits',
  'quickshed-notes',
  'quickshed-url-shortener',
  'quickshed-emoji-recent',
  'quickshed-welcomed',
  'quickshed-onboarding-complete',
] as const;

// Keys stored as a raw scalar string (not JSON) by the app.
const SCALAR_KEYS = new Set<string>([
  'quickshed-locale',
  'quickshed-accent-color',
  'quickshed-banner-dismissed',
  'quickshed-welcomed',
  'quickshed-onboarding-complete',
]);

// Boolean-like flags the app stores as the raw string "true". A backup may
// carry either the parsed boolean `true` or the raw string "true" (the export
// helper parses when it can and falls back to the raw string); both are valid.
const FLAG_KEYS = new Set<string>([
  'quickshed-banner-dismissed',
  'quickshed-welcomed',
  'quickshed-onboarding-complete',
]);

// ─── Per-key validators (grounded in each key's reader) ──────────────
//
// Every value is a shared schema re-exported from `storage-shapes`. The
// runtime `normalize*` helpers implement the same element contract with
// filter semantics; here we apply strict wholesale validation so a backup
// with any invalid element is rejected before a single key is written.

const VALIDATORS: Record<string, ZodType> = {
  'quickshed-locale': localeSchema,
  'quickshed-accent-color': accentColorSchema,
  'quickshed-banner-dismissed': flagSchema,
  'quickshed-welcomed': flagSchema,
  'quickshed-onboarding-complete': flagSchema,
  'quickshed-favorites': stringArraySchema,
  'quickshed-recent': stringArraySchema,
  'quickshed-compare': stringArraySchema,
  'quickshed-emoji-recent': stringArraySchema,
  'quickshed-usage': usageSchema,
  'quickshed-collections': collectionsSchema,
  'quickshed-tool-history': historySchema,
  'quickshed-tool-ratings': ratingsSchema,
  'quickshed-habits': habitsSchema,
  'quickshed-notes': notesSchema,
  'quickshed-url-shortener': urlShortenerSchema,
};

// ─── Types ───────────────────────────────────────────────────────────

export interface BackupEntry {
  /** localStorage key to write. */
  key: string;
  /** Canonical raw string value to write (scalar as-is, JSON stringified). */
  raw: string;
}

export type ParseFailureReason =
  | 'invalid-json'
  | 'not-object'
  | 'no-quickshed-keys'
  | 'unknown-keys'
  | 'malformed';

export interface ParseFailure {
  ok: false;
  reason: ParseFailureReason;
  unknownKeys?: string[];
  detail?: string;
}

export interface ParseSuccess {
  ok: true;
  entries: BackupEntry[];
}

export type ParseResult = ParseSuccess | ParseFailure;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ApplyFailure {
  ok: false;
  reason: 'write-failed';
  failedKey: string;
  /** true only if every snapshotted key was restored to its prior state. */
  rolledBack: boolean;
}

export interface ApplySuccess {
  ok: true;
}

export type ApplyResult = ApplySuccess | ApplyFailure;

// ─── Parse ───────────────────────────────────────────────────────────

function encode(key: string, validated: unknown): string {
  if (FLAG_KEYS.has(key)) return 'true';
  if (SCALAR_KEYS.has(key)) return String(validated);
  return JSON.stringify(validated);
}

/**
 * Parse and fully validate a backup file. Performs NO storage writes.
 * Returns the canonical entries to write on success, or a structured
 * failure describing why the payload was rejected.
 */
export function parseBackupFile(text: string): ParseResult {
  let root: unknown;
  try {
    root = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'invalid-json' };
  }

  if (typeof root !== 'object' || root === null || Array.isArray(root)) {
    return { ok: false, reason: 'not-object' };
  }

  const obj = root as Record<string, unknown>;
  const allKeys = Object.keys(obj);

  const unknown: string[] = [];
  const known: string[] = [];
  for (const key of allKeys) {
    if (!key.startsWith('quickshed-')) continue; // never import outside our namespace
    if (key in VALIDATORS) known.push(key);
    else unknown.push(key);
  }

  // Unknown quickshed keys => reject the whole import (no partial import,
  // no silent write of structures this codebase does not understand).
  if (unknown.length > 0) {
    return { ok: false, reason: 'unknown-keys', unknownKeys: unknown };
  }
  if (known.length === 0) {
    return { ok: false, reason: 'no-quickshed-keys' };
  }

  const entries: BackupEntry[] = [];
  for (const key of known) {
    const schema = VALIDATORS[key];
    const result = schema.safeParse(obj[key]);
    if (!result.success) {
      const first = result.error.issues[0];
      return {
        ok: false,
        reason: 'malformed',
        detail: `${key}: ${first?.path.join('.') || '(root)'} ${first?.message ?? 'invalid'}`,
      };
    }
    entries.push({ key, raw: encode(key, result.data) });
  }

  return { ok: true, entries };
}

// ─── Apply (transactional) ───────────────────────────────────────────

/**
 * Apply validated entries transactionally. Snapshots the prior value and
 * existence of every affected key, writes them all, and on any write failure
 * restores each key to its exact prior state (re-set if it existed, removed
 * if it was newly introduced by this import). Leaves no partial import.
 */
export function applyBackup(
  entries: BackupEntry[],
  storage: StorageLike,
): ApplyResult {
  const snapshot = entries.map(({ key }) => {
    const prev = storage.getItem(key);
    return { key, existed: prev !== null, value: prev };
  });

  for (const { key, raw } of entries) {
    try {
      storage.setItem(key, raw);
    } catch {
      let rolledBack = true;
      for (const s of snapshot) {
        try {
          if (s.existed) storage.setItem(s.key, s.value as string);
          else storage.removeItem(s.key);
        } catch {
          // Best-effort rollback; report that storage may be inconsistent.
          rolledBack = false;
        }
      }
      return { ok: false, reason: 'write-failed' as const, failedKey: key, rolledBack };
    }
  }

  return { ok: true };
}

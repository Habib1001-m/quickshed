/**
 * F2 — Shared, storage-agnostic shape definitions for QuickShed localStorage.
 *
 * This module is the single source of truth for "what a valid stored value
 * looks like" for every `quickshed-*` storage key. Two consumers share it:
 *
 *   1. Import trust boundary — `src/lib/backup-import.ts` builds its strict
 *      per-key zod validators from the element schemas exported here. A backup
 *      with ANY invalid element is rejected wholesale (no partial import).
 *
 *   2. Runtime readers — `store.ts`, `tool-history.ts`, `tool-ratings.ts` and
 *      the tool components call the `normalize*` helpers below. These KEEP
 *      valid elements and DROP invalid ones (filter semantics), so malformed
 *      JSON, primitive roots, null, wrong element types, or invalid record
 *      values resolve to a safe typed fallback and never throw.
 *
 * The element-level zod schemas are the shared structural contract. The runtime
 * normalizers are intentionally a little more lenient in two documented places
 * (collection `tools` defaulting to `[]`, ratings clamped to the supported
 * 1–5 range, usage restricted to finite non-negative counts) so recoverable
 * entries are kept instead of discarded — see "Runtime policy" notes below.
 *
 * Pure: no React, no `window`. Callers pass an already-parsed value (or the
 * result of `safeJsonParse`); nothing here touches storage directly.
 */
import { z } from 'zod';

// Zod 4 probes the Function constructor while initializing object schemas.
// Keep the production CSP strict by disabling that optional JIT path only in
// the browser bundle; server-side validation keeps its normal default.
if (typeof window !== 'undefined') {
  z.config({ jitless: true });
}

// ─── Canonical types (re-exported by feature modules for back-compat) ─

export interface ToolCollection {
  id: string;
  name: string;
  tools: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ToolHistoryEntry {
  id: string;
  toolId: string;
  timestamp: number;
}

export interface ToolRatingData {
  /** Runtime range is 1–5. Out-of-range values are dropped at read time. */
  rating: number;
  timestamp: number;
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  completedDates: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  color: string;
  updatedAt: number;
}

export interface ShortenedUrl {
  alias: string;
  original: string;
  createdAt: string;
}

// ─── Canonical read caps (single source for readers + writers) ────────

export const MAX_RECENT_TOOLS = 10;
export const MAX_COMPARE_TOOLS = 3;
export const EMOJI_RECENT_CAP = 24;
export const MAX_HISTORY_ENTRIES = 200;

// ─── Element-level zod schemas (shared with backup-import) ────────────
//
// These capture the structural contract for a single valid element. The
// import path wraps them in `z.array` / `z.record` for strict wholesale
// validation; the runtime normalizers below reuse the same field rules but
// apply per-element filtering so a single bad entry cannot poison the rest.

export const localeSchema = z.enum(['ar', 'en']);
export const accentColorIdSchema = z.string().min(1);
/** A flag the app stores as the raw string "true"; backups may carry `true`. */
export const flagSchema = z.union([z.literal(true), z.literal('true')]);

export const stringArraySchema = z.array(z.string());
export const usageValueSchema = z.number();
export const usageSchema = z.record(z.string(), usageValueSchema);

export const collectionElementSchema = z
  .object({
    id: z.string().min(1),
    name: z.string(),
    tools: z.array(z.string()),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
  })
  .transform((c) => {
    const now = Date.now();
    const createdAt = typeof c.createdAt === 'number' ? c.createdAt : now;
    return {
      id: c.id,
      name: c.name,
      tools: c.tools,
      createdAt,
      updatedAt: typeof c.updatedAt === 'number' ? c.updatedAt : createdAt,
    };
  });
export const collectionsSchema = z.array(collectionElementSchema);

export const historyElementSchema = z.object({
  id: z.string().optional(),
  toolId: z.string(),
  timestamp: z.number(),
});
export const toolHistorySchema = z.array(historyElementSchema);

export const ratingValueSchema = z.object({
  rating: z.number(),
  timestamp: z.number().optional(),
});
export const ratingsSchema = z.record(z.string(), ratingValueSchema);

export const habitElementSchema = z.object({
  id: z.string(),
  name: z.string(),
  frequency: z.enum(['daily', 'weekly']),
  completedDates: z.array(z.string()),
});
export const habitsSchema = z.array(habitElementSchema);

export const noteElementSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  category: z.string(),
  color: z.string(),
  updatedAt: z.number(),
});
export const notesSchema = z.array(noteElementSchema);

export const urlShortenerElementSchema = z.object({
  alias: z.string(),
  original: z.string(),
  createdAt: z.string(),
});
export const urlShortenerSchema = z.array(urlShortenerElementSchema);

// ─── safeJsonParse ────────────────────────────────────────────────────

/**
 * Parse a raw storage value to JSON. Returns `null` for both an absent value
 * (`null`/`undefined`) and malformed JSON, so callers can feed the result
 * straight into a `normalize*` helper and always get the safe fallback.
 */
export function safeJsonParse(raw: string | null | undefined): unknown {
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Runtime normalizers (filter semantics) ───────────────────────────
//
// Every helper takes the already-parsed value (`unknown`) and returns a typed,
// safe value. Malformed JSON / primitive / null roots resolve to an empty
// fallback; arrays are filtered element-by-element; records are filtered
// value-by-value. None of these throw.

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Filter to a string array, optionally capped from the front. */
export function normalizeStringArray(value: unknown, cap?: number): string[] {
  if (!Array.isArray(value)) return [];
  const filtered = value.filter((x): x is string => typeof x === 'string');
  return typeof cap === 'number' && cap >= 0 ? filtered.slice(0, cap) : filtered;
}

/**
 * Runtime policy: a usage count must be a finite, non-negative number so the
 * `(count || 0) + 1` increment and "most used" sorting stay sane. Drops
 * non-number, NaN, Infinity, and negative values.
 */
export function normalizeUsageRecord(value: unknown): Record<string, number> {
  if (!isPlainObject(value)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === 'number' && Number.isFinite(v) && v >= 0) out[k] = v;
  }
  return out;
}

/**
 * Runtime policy: keep a collection when its essential `id` + `name` are
 * present (downstream dereferences `collection.tools.length` and renders
 * `name`). Unlike the strict import schema, a missing/non-array `tools` field
 * is recovered to `[]` rather than dropping the record, because the app
 * already has a safe default for it. Invalid `tools` elements are filtered.
 */
export function normalizeCollectionElement(value: unknown): ToolCollection | null {
  if (!isPlainObject(value)) return null;
  const id = value.id;
  const name = value.name;
  if (typeof id !== 'string' || id.length === 0 || typeof name !== 'string') return null;
  const tools = Array.isArray(value.tools)
    ? value.tools.filter((t): t is string => typeof t === 'string')
    : [];
  const now = Date.now();
  const createdAt = typeof value.createdAt === 'number' ? value.createdAt : now;
  return {
    id,
    name,
    tools,
    createdAt,
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : createdAt,
  };
}

export function normalizeCollections(value: unknown): ToolCollection[] {
  if (!Array.isArray(value)) return [];
  const out: ToolCollection[] = [];
  for (const el of value) {
    const c = normalizeCollectionElement(el);
    if (c) out.push(c);
  }
  return out;
}

/**
 * Validate each history element's structure (shared with the import schema),
 * then assign collision-free ids. The result is capped to MAX_HISTORY_ENTRIES
 * (the writer's own cap) so an inflated/manually-edited value cannot bloat
 * rendering. Sorted-by-timestamp is left to the caller.
 */
export function normalizeHistoryEntries(value: unknown): ToolHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  const usedIds = new Set<string>();
  const out: ToolHistoryEntry[] = [];

  for (const candidate of value) {
    const parsed = historyElementSchema.safeParse(candidate);
    if (!parsed.success) continue;
    const { toolId, timestamp } = parsed.data;
    const baseId = `${toolId}-${timestamp}`;
    let entryId =
      typeof parsed.data.id === 'string' && !usedIds.has(parsed.data.id)
        ? parsed.data.id
        : baseId;
    let suffix = 1;
    while (usedIds.has(entryId)) {
      entryId = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(entryId);
    out.push({ id: entryId, toolId, timestamp });
  }

  return out.slice(0, MAX_HISTORY_ENTRIES);
}

/**
 * Runtime policy: keep ratings whose value is an object with a numeric rating
 * in the supported 1–5 range. `timestamp` defaults to 0 when absent/invalid so
 * the typed shape is stable. Non-object and out-of-range values are dropped.
 */
export function normalizeRatings(value: unknown): Record<string, ToolRatingData> {
  if (!isPlainObject(value)) return {};
  const out: Record<string, ToolRatingData> = {};
  for (const [k, v] of Object.entries(value)) {
    const parsed = ratingValueSchema.safeParse(v);
    if (!parsed.success) continue;
    const { rating } = parsed.data;
    if (typeof rating !== 'number' || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      continue;
    }
    const ts = parsed.data.timestamp;
    out[k] = { rating, timestamp: typeof ts === 'number' ? ts : 0 };
  }
  return out;
}

/** Filter habits element-by-element using the shared element schema. */
export function normalizeHabits(value: unknown): Habit[] {
  if (!Array.isArray(value)) return [];
  const out: Habit[] = [];
  for (const el of value) {
    const parsed = habitElementSchema.safeParse(el);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

/** Filter notes element-by-element using the shared element schema. */
export function normalizeNotes(value: unknown): Note[] {
  if (!Array.isArray(value)) return [];
  const out: Note[] = [];
  for (const el of value) {
    const parsed = noteElementSchema.safeParse(el);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

/** Filter shortened-url entries element-by-element using the shared schema. */
export function normalizeUrlShortener(value: unknown): ShortenedUrl[] {
  if (!Array.isArray(value)) return [];
  const out: ShortenedUrl[] = [];
  for (const el of value) {
    const parsed = urlShortenerElementSchema.safeParse(el);
    if (parsed.success) out.push(parsed.data);
  }
  return out;
}

/** Emoji recents: a string array capped at EMOJI_RECENT_CAP. */
export function normalizeEmojiRecent(value: unknown): string[] {
  return normalizeStringArray(value, EMOJI_RECENT_CAP);
}

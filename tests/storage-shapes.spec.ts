import { expect, test } from '@playwright/test';
import {
  safeJsonParse,
  normalizeStringArray,
  normalizeUsageRecord,
  normalizeCollections,
  normalizeCollectionElement,
  normalizeHistoryEntries,
  normalizeRatings,
  normalizeHabits,
  normalizeNotes,
  normalizeUrlShortener,
  normalizeEmojiRecent,
  MAX_RECENT_TOOLS,
  MAX_COMPARE_TOOLS,
  EMOJI_RECENT_CAP,
  MAX_HISTORY_ENTRIES,
} from '../src/lib/storage-shapes';

// ─── safeJsonParse + malformed / primitive / null roots ──────────────

test.describe('storage-shapes: malformed & primitive roots', () => {
  test('safeJsonParse returns null for absent and malformed JSON', () => {
    expect(safeJsonParse(null)).toBeNull();
    expect(safeJsonParse(undefined)).toBeNull();
    expect(safeJsonParse('{not json')).toBeNull();
    expect(safeJsonParse('')).toBeNull(); // JSON.parse('') throws
  });

  test('safeJsonParse returns the parsed value for valid JSON', () => {
    expect(safeJsonParse('[]')).toEqual([]);
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
    expect(safeJsonParse('"hi"')).toBe('hi');
    expect(safeJsonParse('5')).toBe(5);
  });

  // Every shared reader must coerce a malformed/primitive/null root to its
  // empty fallback and never throw.
  test('all array/record normalizers resolve primitive & null roots to safe fallbacks', () => {
    const roots = [null, undefined, 5, 'oops', true, { not: 'an array' }, 0];
    for (const r of roots) {
      expect(normalizeStringArray(r)).toEqual([]);
      expect(normalizeCollections(r)).toEqual([]);
      expect(normalizeHistoryEntries(r)).toEqual([]);
      expect(normalizeHabits(r)).toEqual([]);
      expect(normalizeNotes(r)).toEqual([]);
      expect(normalizeUrlShortener(r)).toEqual([]);
      expect(normalizeEmojiRecent(r)).toEqual([]);
      expect(normalizeUsageRecord(r)).toEqual({});
      expect(normalizeRatings(r)).toEqual({});
    }
    // safeJsonParse feeds these: malformed JSON string → null → empty fallback
    expect(normalizeStringArray(safeJsonParse('{bad'))).toEqual([]);
    expect(normalizeHabits(safeJsonParse('{bad'))).toEqual([]);
  });
});

// ─── String arrays (favorites / recent / compare / emoji) ────────────

test.describe('storage-shapes: string arrays', () => {
  test('filters non-string elements and preserves order', () => {
    expect(normalizeStringArray(['a', 1, null, 'b', true, { x: 1 }, 'c'])).toEqual(['a', 'b', 'c']);
  });

  test('applies the cap from the front', () => {
    const big = Array.from({ length: 30 }, (_, i) => `t${i}`);
    expect(normalizeStringArray(big, 3)).toEqual(['t0', 't1', 't2']);
    expect(normalizeStringArray(big, MAX_RECENT_TOOLS)).toHaveLength(MAX_RECENT_TOOLS);
    expect(normalizeStringArray(big, MAX_COMPARE_TOOLS)).toHaveLength(MAX_COMPARE_TOOLS);
  });

  test('emoji recents cap matches the writer', () => {
    const big = Array.from({ length: 60 }, (_, i) => `😀${i}`);
    const out = normalizeEmojiRecent(big);
    expect(out).toHaveLength(EMOJI_RECENT_CAP);
    expect(out[0]).toBe('😀0');
  });
});

// ─── Usage record ────────────────────────────────────────────────────

test.describe('storage-shapes: usage record', () => {
  test('keeps finite non-negative counts, drops the rest', () => {
    expect(
      normalizeUsageRecord({
        a: 3,
        b: 0,
        c: -1, // negative
        d: NaN, // not a number-ish
        e: Infinity, // not finite
        f: '5', // wrong type
        g: null,
        h: 2.5,
      }),
    ).toEqual({ a: 3, b: 0, h: 2.5 });
  });

  test('rejects array roots (arrays are objects but not records)', () => {
    expect(normalizeUsageRecord([1, 2, 3])).toEqual({});
  });
});

// ─── Collections ─────────────────────────────────────────────────────

test.describe('storage-shapes: collections', () => {
  test('recovers the F1 crash payload (missing tools) instead of crashing', () => {
    // The exact payload from the final review that crashed collection.tools.length.
    const out = normalizeCollections([{ id: 'bad', name: 'Malformed' }]);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({ id: 'bad', name: 'Malformed', tools: [] });
    expect(typeof out[0].createdAt).toBe('number');
    expect(typeof out[0].updatedAt).toBe('number');
  });

  test('drops entries missing essential id/name, filters non-string tools', () => {
    const out = normalizeCollections([
      { id: 'c1', name: 'Ok', tools: ['a', 1, null, 'b'] }, // tools filtered
      { name: 'NoId' }, // missing id
      { id: '', name: 'EmptyId' }, // empty id
      { id: 'c2', tools: ['x'] }, // missing name
      'junk',
      null,
      { id: 'c3', name: 'AlsoOk', tools: 'nope' }, // tools non-array → []
    ]);
    expect(out.map((c) => c.id)).toEqual(['c1', 'c3']);
    expect(out[0].tools).toEqual(['a', 'b']);
    expect(out[1].tools).toEqual([]);
  });

  test('normalizeCollectionElement returns null for non-objects', () => {
    for (const bad of [null, 'x', 5, []]) {
      expect(normalizeCollectionElement(bad)).toBeNull();
    }
  });
});

// ─── Tool history ────────────────────────────────────────────────────

test.describe('storage-shapes: tool history', () => {
  test('drops malformed entries and keeps valid ones', () => {
    const out = normalizeHistoryEntries([
      { toolId: 'a', timestamp: 100 },
      { id: 'e2', toolId: 'b', timestamp: 200 },
      { toolId: 'no-ts' }, // missing timestamp
      { timestamp: 300 }, // missing toolId
      'nope',
      null,
      { toolId: 'c', timestamp: '300' }, // timestamp not a number
    ]);
    expect(out).toEqual([
      { id: 'a-100', toolId: 'a', timestamp: 100 },
      { id: 'e2', toolId: 'b', timestamp: 200 },
    ]);
  });

  test('dedupes colliding ids deterministically', () => {
    const out = normalizeHistoryEntries([
      { id: 'dup', toolId: 'a', timestamp: 1 },
      { id: 'dup', toolId: 'b', timestamp: 2 },
    ]);
    expect(out.map((e) => e.id)).toEqual(['dup', 'b-2']);
  });

  test('caps to MAX_HISTORY_ENTRIES (matches the writer)', () => {
    const big = Array.from({ length: MAX_HISTORY_ENTRIES + 50 }, (_, i) => ({
      toolId: `t${i}`,
      timestamp: i,
    }));
    expect(normalizeHistoryEntries(big)).toHaveLength(MAX_HISTORY_ENTRIES);
  });
});

// ─── Ratings ─────────────────────────────────────────────────────────

test.describe('storage-shapes: tool ratings', () => {
  test('drops null / invalid / out-of-range records', () => {
    const out = normalizeRatings({
      'good-3': { rating: 3, timestamp: 100 },
      'good-5': { rating: 5 },
      'null-val': null,
      'string-rating': { rating: 'high' },
      'zero': { rating: 0 }, // below 1
      'six': { rating: 6 }, // above 5
      'nan': { rating: NaN },
      'not-obj': 'maybe',
      'infinity': { rating: Infinity },
    });
    expect(Object.keys(out).sort()).toEqual(['good-3', 'good-5']);
    expect(out['good-3']).toEqual({ rating: 3, timestamp: 100 });
    expect(out['good-5']).toEqual({ rating: 5, timestamp: 0 }); // missing ts → 0
  });
});

// ─── Habits ──────────────────────────────────────────────────────────

test.describe('storage-shapes: habits', () => {
  test('drops missing/non-array completedDates, wrong frequency, non-object entries, and bad completedDates elements', () => {
    const out = normalizeHabits([
      { id: 'h1', name: 'Read', frequency: 'daily', completedDates: ['2024-01-01'] }, // valid
      { id: 'h2', name: 'BadDates', frequency: 'daily', completedDates: '2024-01-01' }, // completedDates not array
      { id: 'h3', name: 'NoDates', frequency: 'daily' }, // missing completedDates
      { id: 'h4', name: 'BadFreq', frequency: 'hourly', completedDates: [] }, // bad frequency
      { id: 'h5', name: 'DirtyDates', frequency: 'weekly', completedDates: ['2024-01-01', 5, null] }, // bad element → whole habit dropped
      { id: 'h6', name: 'Weekly', frequency: 'weekly', completedDates: ['2024-01-01', '2024-01-08'] }, // valid
      'nope',
      null,
    ]);
    expect(out.map((h) => h.id)).toEqual(['h1', 'h6']);
  });
});

// ─── Notes ───────────────────────────────────────────────────────────

test.describe('storage-shapes: notes', () => {
  test('drops entries with missing/non-string fields', () => {
    const valid = { id: 'n1', title: 'T', content: 'C', category: 'general', color: 'default', updatedAt: 1 };
    const out = normalizeNotes([
      valid,
      { id: 'n2', title: 'NoContent', category: 'general', color: 'default', updatedAt: 1 }, // missing content
      { id: 'n3', title: 5, content: 'C', category: 'general', color: 'default', updatedAt: 1 }, // title not string
      { id: 'n4', title: 'T', content: 'C', category: 'general', color: 'default', updatedAt: '1' }, // updatedAt not number
      null,
      'junk',
    ]);
    expect(out).toEqual([valid]);
  });
});

// ─── URL shortener ───────────────────────────────────────────────────

test.describe('storage-shapes: url shortener', () => {
  test('drops malformed entries', () => {
    const out = normalizeUrlShortener([
      { alias: 'a', original: 'https://x.com', createdAt: '2024-01-01' },
      { alias: 'b', original: 'https://y.com' }, // missing createdAt
      { alias: 5, original: 'https://z.com', createdAt: '2024-01-01' }, // alias not string
      null,
      'junk',
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].alias).toBe('a');
  });
});

// ─── Valid current-format data remains usable ────────────────────────

test.describe('storage-shapes: valid data round-trips', () => {
  test('favorites / recent / compare / emoji keep valid values', () => {
    expect(normalizeStringArray(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
    // recent is capped to MAX_RECENT_TOOLS but valid in-range data is intact
    const recent = ['t0', 't1', 't2'];
    expect(normalizeStringArray(recent, MAX_RECENT_TOOLS)).toEqual(recent);
  });

  test('usage keeps a clean record', () => {
    expect(normalizeUsageRecord({ 'json-formatter': 5, 'qrcode': 2 })).toEqual({
      'json-formatter': 5,
      qrcode: 2,
    });
  });

  test('collections preserve explicit timestamps and tools', () => {
    const out = normalizeCollections([
      { id: 'c1', name: 'My', tools: ['json-formatter'], createdAt: 10, updatedAt: 20 },
    ]);
    expect(out).toEqual([
      { id: 'c1', name: 'My', tools: ['json-formatter'], createdAt: 10, updatedAt: 20 },
    ]);
  });

  test('ratings within 1–5 are preserved', () => {
    expect(normalizeRatings({ 'json-formatter': { rating: 4, timestamp: 9 } })).toEqual({
      'json-formatter': { rating: 4, timestamp: 9 },
    });
  });

  test('habits / notes / urls preserve valid entries', () => {
    expect(
      normalizeHabits([{ id: 'h', name: 'Read', frequency: 'daily', completedDates: ['2024-01-01'] }]),
    ).toHaveLength(1);
    expect(
      normalizeNotes([
        { id: 'n', title: 'T', content: 'C', category: 'general', color: 'default', updatedAt: 1 },
      ]),
    ).toHaveLength(1);
    expect(
      normalizeUrlShortener([{ alias: 'a', original: 'https://x.com', createdAt: '2024-01-01' }]),
    ).toHaveLength(1);
  });
});

import { expect, test } from '@playwright/test';
import {
  parseBackupFile,
  applyBackup,
  KNOWN_STORAGE_KEYS,
  type BackupEntry,
  type StorageLike,
} from '../src/lib/backup-import';

// ─── Pure logic (runs in Node, no browser) ───────────────────────────

function fakeStorage(initial: Record<string, string> = {}): StorageLike & {
  store: Map<string, string>;
} {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    store,
    getItem: (k) => (store.has(k) ? (store.get(k) as string) : null),
    setItem: (k, v) => {
      store.set(k, v);
    },
    removeItem: (k) => {
      store.delete(k);
    },
  };
}

test.describe('backup-import: pure parse + apply', () => {
  test('rejects malformed JSON', () => {
    const r = parseBackupFile('{not valid json');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('invalid-json');
  });

  test('rejects primitive / array / null root payloads', () => {
    for (const bad of ['5', '"hello"', '[]', 'null', 'true']) {
      const r = parseBackupFile(bad);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe('not-object');
    }
  });

  test('rejects empty object and non-QuickShed object', () => {
    for (const payload of ['{}', JSON.stringify({ settings: 1 })]) {
      const r = parseBackupFile(payload);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.reason).toBe('no-quickshed-keys');
    }
  });

  test('rejects unknown quickshed keys (no partial import)', () => {
    const r = parseBackupFile(
      JSON.stringify({ 'quickshed-locale': 'en', 'quickshed-evil': {} }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.reason).toBe('unknown-keys');
      expect(r.unknownKeys).toEqual(['quickshed-evil']);
    }
  });

  test('rejects malformed collections (reproduces the F1 crash payload)', () => {
    // Payload from the review that crashed collection.tools.length consumers.
    const r = parseBackupFile(
      JSON.stringify({ 'quickshed-collections': [{ id: 'bad', name: 'Malformed' }] }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('malformed');
  });

  test('accepts a valid backup and emits canonical raw values', () => {
    const r = parseBackupFile(
      JSON.stringify({
        'quickshed-locale': 'en',
        'quickshed-collections': [
          { id: 'c1', name: 'C', tools: ['json-formatter'], createdAt: 1, updatedAt: 2 },
        ],
        'quickshed-welcomed': true, // boolean form of a flag
      }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      const map: Record<string, string> = Object.fromEntries(
        r.entries.map((e) => [e.key, e.raw]),
      );
      expect(map['quickshed-locale']).toBe('en'); // scalar stored as-is
      expect(map['quickshed-welcomed']).toBe('true'); // flag normalized to raw "true"
      const cols = JSON.parse(map['quickshed-collections']);
      expect(cols[0].tools).toEqual(['json-formatter']);
    }
  });

  test('normalizes missing timestamps on otherwise-valid collections', () => {
    const r = parseBackupFile(
      JSON.stringify({ 'quickshed-collections': [{ id: 'c1', name: 'C', tools: [] }] }),
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      const cols = JSON.parse(r.entries[0].raw);
      expect(typeof cols[0].createdAt).toBe('number');
      expect(typeof cols[0].updatedAt).toBe('number');
    }
  });

  test('KNOWN_STORAGE_KEYS is fully quickshed-namespaced', () => {
    for (const k of KNOWN_STORAGE_KEYS) {
      expect(k.startsWith('quickshed-')).toBe(true);
    }
    // Sanity: the two keys referenced by the review's crash exist.
    expect(KNOWN_STORAGE_KEYS).toContain('quickshed-collections');
    expect(KNOWN_STORAGE_KEYS).toContain('quickshed-habits');
  });

  test('applyBackup writes all entries (round-trip)', () => {
    const fs = fakeStorage({ 'quickshed-locale': 'ar' });
    const parsed = parseBackupFile(
      JSON.stringify({
        'quickshed-locale': 'en',
        'quickshed-collections': [{ id: 'c', name: 'C', tools: [] }],
      }),
    );
    if (!parsed.ok) throw new Error('expected parse success');

    const res = applyBackup(parsed.entries, fs);
    expect(res.ok).toBe(true);
    expect(fs.store.get('quickshed-locale')).toBe('en');
    expect(fs.store.has('quickshed-collections')).toBe(true);
  });

  test('applyBackup rolls back on write failure: restores prior value AND removes newly-introduced keys', () => {
    const fs = fakeStorage({ 'quickshed-locale': 'ar' });
    // Inject a failure on the second write (the new collections key).
    const realSet = fs.setItem.bind(fs);
    fs.setItem = (key: string, value: string) => {
      if (key === 'quickshed-collections') throw new Error('quota');
      realSet(key, value);
    };

    const entries: BackupEntry[] = [
      { key: 'quickshed-locale', raw: 'en' }, // pre-existing, will be replaced then restored
      { key: 'quickshed-collections', raw: '[]' }, // new key; write throws
    ];

    const res = applyBackup(entries, fs);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe('write-failed');
      expect(res.failedKey).toBe('quickshed-collections');
      expect(res.rolledBack).toBe(true);
    }
    // Exact prior state restored: locale back to 'ar', collections absent.
    expect(fs.store.get('quickshed-locale')).toBe('ar');
    expect(fs.store.has('quickshed-collections')).toBe(false);
  });
});

// ─── UI / E2E (drives the real import flow) ──────────────────────────

// The `quickshed-settings` listener is wired by RoutePageShell in a useEffect
// that runs only AFTER client hydration. The header Settings button is
// server-rendered and visible before that, so dispatching the open event too
// early is a no-op. We therefore keep (re)opening until the dynamic settings
// panel has actually mounted its file input — a deterministic wait for
// hydration, with no fixed sleeps.
async function openSettings(page: import('@playwright/test').Page, locale: 'en' | 'ar') {
  const settingsLabel = locale === 'ar' ? 'الإعدادات' : 'Settings';
  await page.getByRole('button', { name: settingsLabel, exact: true }).waitFor({ state: 'visible' });
  const fileInput = page.locator('input[type="file"]').first();
  await expect
    .poll(
      async () => {
        await page.evaluate(() => window.dispatchEvent(new CustomEvent('quickshed-settings')));
        return page.locator('input[type="file"]').count();
      },
      { timeout: 15_000, intervals: [200, 500, 1000] },
    )
    .toBeGreaterThanOrEqual(1);
  return fileInput;
}

test.describe('backup-import: UI flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('quickshed-welcomed', 'true');
      localStorage.setItem('quickshed-onboarding-complete', 'true');
      localStorage.setItem('quickshed-banner-dismissed', 'true');
    });
  });

  test('rejects malformed collections and leaves storage unchanged (EN)', async ({ page }) => {
    await page.goto('/en');
    const fileInput = await openSettings(page, 'en');

    // Seed existing data to prove the rejected import does not mutate it.
    await page.evaluate(() =>
      localStorage.setItem(
        'quickshed-collections',
        JSON.stringify([{ id: 'orig', name: 'Orig', tools: [], createdAt: 1, updatedAt: 1 }]),
      ),
    );

    await fileInput.setInputFiles({
      name: 'bad.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({ 'quickshed-collections': [{ id: 'bad', name: 'Malformed' }] }),
      ),
    });

    await expect(page.getByText(/not a valid QuickShed backup/i)).toBeVisible();

    const after = await page.evaluate(() => localStorage.getItem('quickshed-collections'));
    expect(after).toContain('"id":"orig"');
  });

  test('cancel confirmation leaves storage unchanged (EN)', async ({ page }) => {
    await page.goto('/en');
    const fileInput = await openSettings(page, 'en');
    const before = JSON.stringify(['a']);
    await page.evaluate((v) => localStorage.setItem('quickshed-favorites', v), before);

    await fileInput.setInputFiles({
      name: 'ok.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({ 'quickshed-favorites': ['x', 'y'], 'quickshed-locale': 'en' }),
      ),
    });

    await expect(page.getByRole('heading', { name: /import backup\?/i })).toBeVisible();
    await page.getByRole('alertdialog').getByRole('button', { name: /^cancel$/i }).click();

    expect(await page.evaluate(() => localStorage.getItem('quickshed-favorites'))).toBe(before);
  });

  test('valid backup confirmation round-trips into storage (EN)', async ({ page }) => {
    await page.goto('/en');
    const fileInput = await openSettings(page, 'en');

    await fileInput.setInputFiles({
      name: 'ok.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          'quickshed-favorites': ['json-formatter'],
          'quickshed-collections': [{ id: 'c1', name: 'My', tools: ['json-formatter'] }],
        }),
      ),
    });

    await expect(page.getByRole('heading', { name: /import backup\?/i })).toBeVisible();
    await page.getByRole('alertdialog').getByRole('button', { name: /^import$/i }).click();

    // applyBackup writes synchronously on confirm; assert the persisted values.
    await expect
      .poll(() => page.evaluate(() => localStorage.getItem('quickshed-favorites')))
      .toBe(JSON.stringify(['json-formatter']));
    const cols = await page.evaluate(() => localStorage.getItem('quickshed-collections'));
    expect(cols).not.toBeNull();
    expect(JSON.parse(cols as string)[0].tools).toEqual(['json-formatter']);
  });

  test('shows Arabic confirmation copy and cancel is a no-op (AR)', async ({ page }) => {
    await page.goto('/ar');
    const fileInput = await openSettings(page, 'ar');

    await fileInput.setInputFiles({
      name: 'ok.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify({ 'quickshed-favorites': ['x'] })),
    });

    await expect(page.getByRole('heading', { name: /استيراد نسخة احتياطية؟/ })).toBeVisible();
    await expect(page.getByRole('alertdialog').getByRole('button', { name: /^استيراد$/ })).toBeVisible();
    await page.getByRole('alertdialog').getByRole('button', { name: /^إلغاء$/ }).click();

    // No QuickShed data was written.
    expect(await page.evaluate(() => localStorage.getItem('quickshed-favorites'))).toBeNull();
  });

  test('injected storage failure rolls back to the exact previous state (EN)', async ({ page }) => {
    await page.addInitScript(() => {
      const orig = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key: string, value: string) {
        if (key === 'quickshed-collections') {
          throw new DOMException('quota exceeded', 'QuotaExceededError');
        }
        orig.call(this, key, value);
      };
    });

    await page.goto('/en');
    const fileInput = await openSettings(page, 'en');
    // Pre-existing locale value that must be restored after the failed write.
    await page.evaluate(() => localStorage.setItem('quickshed-locale', 'ar'));

    await fileInput.setInputFiles({
      name: 'ok.json',
      mimeType: 'application/json',
      buffer: Buffer.from(
        JSON.stringify({
          'quickshed-locale': 'en',
          'quickshed-collections': [{ id: 'c', name: 'C', tools: [] }],
        }),
      ),
    });

    await expect(page.getByRole('heading', { name: /import backup\?/i })).toBeVisible();
    await page.getByRole('alertdialog').getByRole('button', { name: /^import$/i }).click();

    await expect(page.getByText(/previous data was restored/i)).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('quickshed-locale'))).toBe('ar');
    expect(await page.evaluate(() => localStorage.getItem('quickshed-collections'))).toBeNull();
  });
});

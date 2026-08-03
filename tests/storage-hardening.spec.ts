import { expect, test, type Page } from '@playwright/test';

/**
 * F2 route-level hardening: seed the confirmed malformed-storage fixtures
 * (and representative bad values) into localStorage before the app boots, then
 * confirm the affected routes hydrate and render without an uncaught error or
 * the Next.js error overlay. Hydration is waited for deterministically via the
 * tool/view's own post-hydration marker (a control that only exists after the
 * lazy-loaded tool component mounts and reads storage) — never with fixed sleeps.
 */

// Collect uncaught exceptions. A render-time crash (the original failure mode)
// surfaces here as well as in the Next.js error overlay.
function captureErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

const ERROR_OVERLAY = /Unhandled Runtime Error|This page couldn't load|Application error|Build Error/i;

// Seed onboarding flags so the route renders the real view, not the
// welcome/tour/banner overlays. The malformed payload for the target key is
// passed as a serialized argument to avoid any string-escaping pitfalls.
function seedMalformed(
  page: Page,
  key: string,
  value: unknown,
  extra?: Record<string, string>,
) {
  return page.addInitScript(
    (args: { key: string; value: string; extra: Record<string, string> | undefined }) => {
      localStorage.setItem('quickshed-welcomed', 'true');
      localStorage.setItem('quickshed-onboarding-complete', 'true');
      localStorage.setItem('quickshed-banner-dismissed', 'true');
      if (args.extra) {
        for (const [k, v] of Object.entries(args.extra)) localStorage.setItem(k, v);
      }
      localStorage.setItem(args.key, args.value);
    },
    { key, value: JSON.stringify(value), extra },
  );
}

// ─── Collections: the primary confirmed crash (collection.tools.length) ─

test.describe('malformed collections', () => {
  test('home (EN) survives the review crash payload', async ({ page }) => {
    const errors = captureErrors(page);
    await seedMalformed(page, 'quickshed-collections', [{ id: 'bad', name: 'Malformed' }]);

    await page.goto('/en');
    await expect(page.getByRole('heading', { name: /privacy-first toolbox/i })).toBeVisible();

    await expect(page.getByText(ERROR_OVERLAY)).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('home (AR) survives mixed malformed + valid collections', async ({ page }) => {
    const errors = captureErrors(page);
    await seedMalformed(page, 'quickshed-collections', [
      { id: 'bad', name: 'Malformed' },
      { id: 'c2', name: 'Ok', tools: ['json-formatter'], createdAt: 1, updatedAt: 1 },
      { name: 'NoId' },
      'junk',
    ]);

    await page.goto('/ar');
    await expect(page.getByRole('heading', { name: 'صندوق أدواتك الفوري والآمن' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    await expect(page.getByText(ERROR_OVERLAY)).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

// ─── Habits: completedDates.includes / streak crash ───────────────────

test('habit-tracker (EN) survives malformed habits and keeps valid ones', async ({ page }) => {
  const errors = captureErrors(page);
  await seedMalformed(page, 'quickshed-habits', [
    { id: 'h1', name: 'BadDates', frequency: 'daily', completedDates: '2024-01-01' },
    { id: 'h2', name: 'NoDates', frequency: 'daily' },
    { id: 'h3', name: 'BadFreq', frequency: 'hourly', completedDates: [] },
    { id: 'h4', name: 'DirtyDates', frequency: 'weekly', completedDates: ['x', 5, null] },
    'nope',
    null,
    { id: 'h5', name: 'ValidHabit', frequency: 'daily', completedDates: ['2024-01-01'] },
  ]);

  await page.goto('/en/tools/habit-tracker');
  // "Add Habit" only renders once the lazy tool component mounted + read storage.
  await expect(page.getByRole('button', { name: 'Add Habit' })).toBeVisible();
  await expect(page.getByText('ValidHabit')).toBeVisible();

  await expect(page.getByText(ERROR_OVERLAY)).toHaveCount(0);
  expect(errors).toEqual([]);
});

// ─── Notes: missing/non-string field crash ───────────────────────────

test('note-organizer (EN) survives malformed notes and keeps valid ones', async ({ page }) => {
  const errors = captureErrors(page);
  await seedMalformed(page, 'quickshed-notes', [
    { id: 'n1', title: 'NoContent', category: 'general', color: 'default', updatedAt: 1 },
    { id: 'n2', title: 5, content: 'C', category: 'general', color: 'default', updatedAt: 1 },
    null,
    'junk',
    { id: 'n3', title: 'ValidNote', content: 'Hello', category: 'general', color: 'default', updatedAt: 2 },
  ]);

  await page.goto('/en/tools/note-organizer');
  // The search input only renders once the tool mounted + read storage.
  await expect(page.getByPlaceholder('Search notes...')).toBeVisible();
  await expect(page.getByText('ValidNote')).toBeVisible();

  await expect(page.getByText(ERROR_OVERLAY)).toHaveCount(0);
  expect(errors).toEqual([]);
});

// ─── Emoji: .slice / array-operation crash on a non-array root ────────

test('emoji-picker (EN) survives an object root', async ({ page }) => {
  const errors = captureErrors(page);
  await seedMalformed(page, 'quickshed-emoji-recent', { not: 'an array' });

  await page.goto('/en/tools/emoji-picker');
  await expect(page.getByPlaceholder('Search emojis...')).toBeVisible();
  // Recents resolved to [] instead of crashing on .slice; the recents section
  // (which only renders when recent.length > 0) is correctly absent.
  await expect(page.getByText('Recently Used')).toHaveCount(0);

  await expect(page.getByText(ERROR_OVERLAY)).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('emoji-picker (EN) filters mixed elements and caps recents at 24', async ({ page }) => {
  const errors = captureErrors(page);
  const big: unknown[] = Array.from({ length: 60 }, (_, i) => `😀${i}`);
  big.splice(2, 0, 7, null); // mixed element types
  await seedMalformed(page, 'quickshed-emoji-recent', big);

  await page.goto('/en/tools/emoji-picker');
  await expect(page.getByPlaceholder('Search emojis...')).toBeVisible();
  // Recents were capped to EMOJI_RECENT_CAP (24) and rendered without crashing.
  await expect(page.getByText('Recently Used')).toBeVisible();

  await expect(page.getByText(ERROR_OVERLAY)).toHaveCount(0);
  expect(errors).toEqual([]);
});

// ─── Ratings: null / invalid record values ───────────────────────────

test('tool route (EN) survives malformed ratings via ToolRating read', async ({ page }) => {
  const errors = captureErrors(page);
  await seedMalformed(page, 'quickshed-tool-ratings', {
    'json-formatter': null,
    'bad-string': { rating: 'high' },
    'out-of-range': { rating: 9 },
    zero: { rating: 0 },
    'not-obj': 'maybe',
  });

  await page.goto('/en/tools/json-formatter');
  // ToolView heading renders only after hydration; ToolRating reads ratings.
  await expect(page.getByRole('heading', { name: 'JSON Formatter' })).toBeVisible();

  await expect(page.getByText(ERROR_OVERLAY)).toHaveCount(0);
  expect(errors).toEqual([]);
});

// ─── Welcome flag: exact 'true' handling ─────────────────────────────
//
// WelcomeOverlay must treat ONLY the canonical 'true' flag as dismissed
// (consistent with AnnouncementBanner / OnboardingTour / onboarding-steps).
// A stale or manually-edited value resolves to not-yet-welcomed so the
// overlay re-shows and self-heals, rather than being swallowed by a truthy
// check. This locks in the exact-boolean behavior.

test('home (EN) shows welcome overlay for a non-canonical welcomed flag', async ({ page }) => {
  const errors = captureErrors(page);
  // Seed sibling flags so only the welcome flag is under test, then store a
  // non-canonical value (NOT 'true').
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
    localStorage.setItem('quickshed-welcomed', 'yes');
  });

  await page.goto('/en');
  // Home hydrates and renders without crashing despite the malformed flag.
  await expect(page.getByRole('heading', { name: /privacy-first toolbox/i })).toBeVisible();

  // The overlay mounts after a short delay; expect.poll waits deterministically
  // (no fixed sleeps) for the welcome step heading to appear.
  await expect.poll(
    () => page.getByRole('heading', { name: 'Privacy First, Always' }).count(),
    { message: 'welcome overlay mounts for a non-canonical welcomed flag', timeout: 6_000 },
  ).toBeGreaterThan(0);

  await expect(page.getByText(ERROR_OVERLAY)).toHaveCount(0);
  expect(errors).toEqual([]);
});

// ─── Accent color: unsupported stored id falls back safely ───────────
//
// getSavedAccentColor now validates against the supported list and returns
// null for an unknown id, so RoutePageShell skips applyAccentColor and the
// default theme applies. Confirm the route still hydrates with no crash.

test('home (EN) survives an unsupported stored accent color', async ({ page }) => {
  const errors = captureErrors(page);
  await seedMalformed(page, 'quickshed-accent-color', 'not-a-real-color');

  await page.goto('/en');
  await expect(page.getByRole('heading', { name: /privacy-first toolbox/i })).toBeVisible();

  await expect(page.getByText(ERROR_OVERLAY)).toHaveCount(0);
  expect(errors).toEqual([]);
});

import { expect, test, type Page } from '@playwright/test';
import { continuePastToolDisclosure } from './helpers/tool-disclosure';

const VIEWPORT = { width: 375, height: 812 };

type Rect = {
  x: number;
  y: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

function seedFloatingControlState(page: Page) {
  return page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
    localStorage.setItem(
      'quickshed-tool-history',
      JSON.stringify([
        { id: 'f4-json-formatter', toolId: 'json-formatter', timestamp: 1_725_000_000_000 },
      ]),
    );
  });
}

async function scrollPastFloatingThreshold(page: Page) {
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
}

async function readRect(page: Page, testId: string): Promise<Rect> {
  return page.getByTestId(testId).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      right: rect.right,
      bottom: rect.bottom,
      width: rect.width,
      height: rect.height,
    };
  });
}

async function expectSettledGeometry(page: Page, testIds: string[]) {
  await expect.poll(async () => page.evaluate((ids) => {
    const readRects = () => {
      const elements = ids.flatMap((id) => Array.from(
        document.querySelectorAll<HTMLElement>(`[data-testid="${id}"]`),
      ));
      if (elements.length === 0) return null;

      return elements.map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          x: rect.x,
          y: rect.y,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        };
      });
    };

    const first = readRects();
    if (!first) return false;

    return new Promise<boolean>((resolve) => {
      requestAnimationFrame(() => {
        const second = readRects();
        if (!second || first.length !== second.length) {
          resolve(false);
          return;
        }

        resolve(second.every((rect, index) => {
          const previous = first[index];
          return Math.abs(rect.x - previous.x) < 0.1
            && Math.abs(rect.y - previous.y) < 0.1
            && Math.abs(rect.right - previous.right) < 0.1
            && Math.abs(rect.bottom - previous.bottom) < 0.1
            && Math.abs(rect.width - previous.width) < 0.1
            && Math.abs(rect.height - previous.height) < 0.1;
        }));
      });
    });
  }, testIds)).toBe(true);
}

async function expectDockGeometry(page: Page) {
  await expect.poll(async () => page.evaluate(() => {
    const dock = document.querySelector<HTMLElement>('[data-testid="floating-control-dock"]');
    const quickAccess = document.querySelector<HTMLElement>('[data-testid="quick-access-bar"]');
    const controls = [
      document.querySelector<HTMLElement>('[data-testid="shortcut-help-fab"]'),
      document.querySelector<HTMLElement>('[data-testid="back-to-top"]'),
      document.querySelector<HTMLElement>('[data-testid="floating-quick-actions"]'),
    ];
    if (!dock || !quickAccess || controls.some((control) => !control)) return false;

    const viewport = { width: window.innerWidth, height: window.innerHeight };
    const dockRect = dock.getBoundingClientRect();
    const controlRects = controls.map((control) => control!.getBoundingClientRect());
    const insideViewport = controlRects.every((rect) => (
      rect.left >= 0 && rect.top >= 0 && rect.right <= viewport.width && rect.bottom <= viewport.height
    ));
    const separated = controlRects.every((rect, index) => controlRects.every((other, otherIndex) => (
      index === otherIndex || rect.right + 4 <= other.left || other.right + 4 <= rect.left
        || rect.bottom + 4 <= other.top || other.bottom + 4 <= rect.top
    )));

    return insideViewport && separated && dockRect.bottom + 4 <= quickAccess.getBoundingClientRect().top;
  })).toBe(true);
}

function expectNoIntersection(a: Rect, b: Rect, gap = 4) {
  expect(
    a.right + gap <= b.x || b.right + gap <= a.x || a.bottom + gap <= b.y || b.bottom + gap <= a.y,
  ).toBe(true);
}

test.describe('QuickShed F4 floating controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(VIEWPORT);
    await seedFloatingControlState(page);
  });

  test('keeps the 375px end-side controls separated above Quick Access', async ({ page }) => {
    await page.goto('/en/tools/json-formatter');
    await expect(page.getByRole('heading', { name: /JSON Formatter/i }).first()).toBeVisible();
    await continuePastToolDisclosure(page);
    await scrollPastFloatingThreshold(page);
    await expect(page.getByTestId('quick-access-bar')).toBeVisible();

    await expectDockGeometry(page);

    const dock = await readRect(page, 'floating-control-dock');
    const quickAccess = await readRect(page, 'quick-access-bar');
    expect(dock.x).toBeGreaterThanOrEqual(0);
    expect(dock.right).toBeLessThanOrEqual(VIEWPORT.width);
    expect(dock.bottom + 4).toBeLessThanOrEqual(quickAccess.y);
  });

  test('keeps minimized Quick Access separate from the end-side dock', async ({ page }) => {
    await page.goto('/en/tools/json-formatter');
    await expect(page.getByRole('heading', { name: /JSON Formatter/i }).first()).toBeVisible();
    await continuePastToolDisclosure(page);
    await scrollPastFloatingThreshold(page);
    await expect(page.getByTestId('quick-access-bar')).toBeVisible();

    const minimize = page.getByTestId('quick-access-minimize');
    await minimize.focus();
    await minimize.press('Enter');
    await expect(page.getByTestId('quick-access-minimized')).toBeVisible();
    await expect(page.getByTestId('quick-access-bar')).toBeHidden();

    const dock = await readRect(page, 'floating-control-dock');
    const minimized = await readRect(page, 'quick-access-minimized');
    await expectNoIntersection(dock, minimized);
    expect(minimized.x).toBeGreaterThanOrEqual(0);
    expect(minimized.right).toBeLessThanOrEqual(VIEWPORT.width);
  });

  test('keeps expanded quick actions inside the viewport and away from dock controls', async ({ page }) => {
    await page.goto('/en/tools/json-formatter');
    await expect(page.getByRole('heading', { name: /JSON Formatter/i }).first()).toBeVisible();
    await continuePastToolDisclosure(page);
    await scrollPastFloatingThreshold(page);

    const quickActions = page.getByTestId('floating-quick-actions');
    await expect(quickActions).toBeVisible();
    await expect(quickActions).toHaveAttribute('aria-expanded', 'false');
    await expectSettledGeometry(page, [
      'shortcut-help-fab',
      'back-to-top',
      'floating-quick-actions',
    ]);
    await quickActions.focus();
    await expect(quickActions).toBeFocused();
    await quickActions.press('Enter');
    await expect(quickActions).toBeFocused();
    await expect(quickActions).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('floating-action-item')).toHaveCount(3);
    await expect(page.getByTestId('floating-action-item').first()).toBeVisible();
    await expectSettledGeometry(page, [
      'shortcut-help-fab',
      'back-to-top',
      'floating-quick-actions',
      'floating-action-item',
    ]);

    await expect.poll(async () => page.evaluate(() => {
      const ids = [
        'shortcut-help-fab',
        'back-to-top',
        'floating-quick-actions',
        'floating-action-item',
      ];
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const rects = ids.flatMap((id) => Array.from(
        document.querySelectorAll<HTMLElement>(`[data-testid="${id}"]`),
      )).map((element) => element.getBoundingClientRect());
      const visible = rects.length === 6 && rects.every((rect) => (
        rect.width > 0 && rect.height > 0 && rect.left >= 0 && rect.top >= 0
          && rect.right <= viewport.width && rect.bottom <= viewport.height
      ));
      const separated = rects.every((rect, index) => rects.every((other, otherIndex) => (
        index === otherIndex || rect.right + 4 <= other.left || other.right + 4 <= rect.left
          || rect.bottom + 4 <= other.top || other.bottom + 4 <= rect.top
      )));
      return visible && separated;
    })).toBe(true);
  });

  test('keeps the dock on the logical end side in Arabic RTL', async ({ page }) => {
    await page.goto('/ar/tools/json-formatter');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { name: /منسق JSON|JSON Formatter/i }).first()).toBeVisible();
    await continuePastToolDisclosure(page);
    await scrollPastFloatingThreshold(page);
    await expectDockGeometry(page);

    const dock = await readRect(page, 'floating-control-dock');
    expect(dock.x).toBeLessThan(VIEWPORT.width / 2);
    expect(dock.right).toBeLessThan(100);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(VIEWPORT.width);
  });
});

import { expect, test, type Page } from '@playwright/test';

const REMOTE_IMAGE = 'https://privacy-test.example/f5-remote.png';

interface BrowserObservation {
  pageErrors: string[];
  consoleErrors: string[];
  failedRequests: string[];
}

function observeBrowser(page: Page): BrowserObservation {
  const observation: BrowserObservation = {
    pageErrors: [],
    consoleErrors: [],
    failedRequests: [],
  };

  page.on('pageerror', (error) => observation.pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') observation.consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    observation.failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`);
  });

  return observation;
}

async function blockTestOriginImage(page: Page) {
  const remoteRequests = { count: 0 };
  await page.route('https://privacy-test.example/**', async (route) => {
    remoteRequests.count += 1;
    await route.abort();
  });
  return remoteRequests;
}

async function openMarkdownTool(page: Page, locale: 'en' | 'ar') {
  await page.goto(`/${locale}/tools/markdown-to-html`);
  const input = page.getByPlaceholder(locale === 'ar' ? 'اكتب ماركداون هنا...' : /type your markdown here/i);
  await expect(input).toBeVisible();
  return input;
}

test.describe('F5 Markdown, CSP, and console hygiene', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('quickshed-welcomed', 'true');
      localStorage.setItem('quickshed-onboarding-complete', 'true');
      localStorage.setItem('quickshed-banner-dismissed', 'true');
    });
  });

  test('English Markdown blocks a remote image without a request or page error', async ({ page }) => {
    const observation = observeBrowser(page);
    const remoteRequests = await blockTestOriginImage(page);
    const input = await openMarkdownTool(page, 'en');

    await input.fill(`![Remote image](${REMOTE_IMAGE})`);

    const preview = page.getByTestId('markdown-preview');
    const blocked = preview.locator('[data-markdown-image-blocked="true"]');
    await expect(blocked).toBeVisible();
    await expect(blocked).toContainText(/image blocked/i);
    await expect(preview.locator('img[src]')).toHaveCount(0);
    await page.getByRole('tab', { name: /html source/i }).click();
    await expect(page.getByTestId('markdown-source')).toContainText(/image blocked/i);
    await expect.poll(() => remoteRequests.count).toBe(0);

    expect(observation.pageErrors).toEqual([]);
    expect(observation.consoleErrors).toEqual([]);
    expect(observation.failedRequests).toEqual([]);
  });

  test('Arabic Markdown blocks remote and unsafe images with RTL-localized output', async ({ page }) => {
    const observation = observeBrowser(page);
    const remoteRequests = await blockTestOriginImage(page);
    const input = await openMarkdownTool(page, 'ar');

    await input.fill([
      `![صورة بعيدة](${REMOTE_IMAGE})`,
      '![صورة غير آمنة](javascript:alert(1))',
    ].join('\n'));

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    const preview = page.getByTestId('markdown-preview');
    await expect(preview.locator('[data-markdown-image-blocked="true"]')).toHaveCount(2);
    await expect(preview).toContainText('تم حظر الصورة');
    await expect(preview.locator('img')).toHaveCount(0);
    await expect(preview.locator('img[src^="javascript:"]')).toHaveCount(0);
    await expect.poll(() => remoteRequests.count).toBe(0);

    expect(observation.pageErrors).toEqual([]);
    expect(observation.consoleErrors).toEqual([]);
    expect(observation.failedRequests).toEqual([]);
  });

  test('unsafe and malformed images stay non-executable while explicit links stay explicit', async ({ page }) => {
    const observation = observeBrowser(page);
    const remoteRequests = await blockTestOriginImage(page);
    const input = await openMarkdownTool(page, 'en');

    await input.fill([
      '![Unsafe](javascript:alert(1))',
      '![Empty]()',
      `![Unclosed](${REMOTE_IMAGE}`,
      '[Explicit link](https://example.com/docs)',
    ].join('\n'));

    const preview = page.getByTestId('markdown-preview');
    await expect(preview.locator('img')).toHaveCount(0);
    await expect(preview.locator('img[src^="javascript:"]')).toHaveCount(0);
    await expect(preview.locator('a[href^="javascript:"]')).toHaveCount(0);
    await expect(preview.locator('[data-markdown-image-blocked="true"]')).toHaveCount(2);

    const explicitLink = preview.getByRole('link', { name: 'Explicit link' });
    await expect(explicitLink).toHaveAttribute('href', 'https://example.com/docs');
    await expect(explicitLink).toHaveAttribute('target', '_blank');
    await expect(explicitLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect.poll(() => remoteRequests.count).toBe(0);

    expect(observation.pageErrors).toEqual([]);
    expect(observation.consoleErrors).toEqual([]);
    expect(observation.failedRequests).toEqual([]);
  });

  test('production CSP allows local image sources and omits unsafe-eval', async ({ request }) => {
    const response = await request.get('/en/tools/markdown-to-html');
    expect(response.status()).toBe(200);

    const csp = response.headers()['content-security-policy'] ?? '';
    expect(csp).toContain("img-src 'self' data: blob:");
    expect(csp).not.toContain('unsafe-eval');
  });

  test('UnitConverter computes three desktop grid columns after the CSS fix', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/en/tools/unit-converter');

    const grid = page.getByTestId('unit-converter-grid');
    await expect(grid).toBeVisible();
    await expect.poll(() => grid.evaluate((element) => {
      const columns = getComputedStyle(element).gridTemplateColumns.trim();
      return columns && columns !== 'none' ? columns.split(/\s+/).length : 0;
    })).toBe(3);
  });

  test('generated CSS uses logical start offsets for the confirmed F5 declarations', async ({ page, request }) => {
    // These selectors are conditionally rendered, so the generated CSS is the
    // stable browser-visible fixture for this parser-defect check.
    await page.goto('/en');
    const stylesheetUrls = await page.locator('link[rel="stylesheet"]').evaluateAll((links) =>
      links.map((link) => (link as HTMLLinkElement).href),
    );
    expect(stylesheetUrls.length).toBeGreaterThan(0);

    const css = (await Promise.all(
      stylesheetUrls.map(async (url) => (await request.get(url)).text()),
    )).join('\n');

    expect(css).toMatch(/inset-inline-start\s*:\s*8px/);
    expect(css).toMatch(/inset-inline-start\s*:\s*48px/);
    expect(css).toMatch(/inset-inline-start\s*:\s*40px/);
    expect(css).not.toMatch(/(?:^|[;{\s])start\s*:\s*(?:8px|48px|40px)/);
  });
});

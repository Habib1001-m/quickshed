import { expect, test, type Page } from '@playwright/test';

type TestWindow = Window & {
  __copiedText?: string;
  __innerHTMLSinkUsed?: boolean;
  __qsXss?: number;
  __xss?: boolean;
};

async function dismissOnboarding(page: Page) {
  await page.getByRole('button', { name: /dismiss/i }).click({ timeout: 1000 }).catch(() => undefined);
  await page.getByRole('button', { name: /skip/i }).click({ timeout: 5000 }).catch(() => undefined);
}

async function selectEncoding(page: Page, name: RegExp) {
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name }).click();
}

test.describe('QuickShed smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('quickshed-welcomed', 'true');
      localStorage.setItem('quickshed-onboarding-complete', 'true');
      localStorage.setItem('quickshed-banner-dismissed', 'true');
    });
  });

  test('renders English home page without framework errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto('/en');

    await expect(page).toHaveTitle(/QuickShed/);
    await expect(page.getByRole('heading', { name: /privacy-first toolbox/i })).toBeVisible();
    await expect(page.getByRole('main').getByText(/90\+ free tools/i)).toBeVisible();
    await expect(page.getByText(/Unhandled Runtime Error|Build Error|Next\.js/i)).toHaveCount(0);
    expect(consoleErrors).toEqual([]);
  });

  test('renders Arabic home page as RTL', async ({ page }) => {
    await page.goto('/ar');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByRole('heading', { name: /صندوق أدواتك الفوري والآمن/i })).toBeVisible();
  });

  test('opens a canonical tool URL', async ({ page }) => {
    await page.goto('/en/tools/json-formatter');

    await expect(page).toHaveURL(/\/en\/tools\/json-formatter$/);
    await expect(page.getByRole('main').getByText(/JSON Formatter/i).first()).toBeVisible();
  });

  test('does not serve release archives from the app', async ({ request }) => {
    for (const path of [
      '/quickshed-complete.zip',
      '/quickshed-complete.tar.gz',
      '/quickshed-v1.0.0.zip',
      '/quickshed-v1.0.0.tar.gz',
    ]) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(404);
      expect(response.headers()['content-type'] ?? '', path).not.toMatch(/application\/(zip|gzip)/i);
    }
  });

  test('copies canonical tool share URLs', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            (window as TestWindow).__copiedText = text;
          },
        },
      });
    });

    await page.goto('/en/tools/json-formatter');
    await dismissOnboarding(page);
    await page.getByRole('button', { name: /copy link/i }).click();

    await expect.poll(
      () => page.evaluate(() => (window as TestWindow).__copiedText)
    ).toBe('http://127.0.0.1:7125/en/tools/json-formatter');
  });

  test('does not render Markdown input as executable HTML', async ({ page }) => {
    await page.addInitScript(() => {
      (window as TestWindow).__xss = false;
    });

    await page.goto('/en/tools/markdown-to-html');
    await dismissOnboarding(page);
    await page.getByPlaceholder(/type your markdown here/i).fill([
      '<img data-xss="markdown" src=x onerror="window.__xss=true">',
      '[bad](javascript:alert(1))',
      '![bad](javascript:alert(1))',
    ].join('\n'));

    await expect(page.locator('img[data-xss="markdown"]')).toHaveCount(0);
    await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
    await expect(page.locator('img[src^="javascript:"]')).toHaveCount(0);
    await expect.poll(
      () => page.evaluate(() => (window as TestWindow).__xss)
    ).toBe(false);
  });

  test('does not render adversarial JSON strings as executable HTML in raw view', async ({ page }) => {
    await page.addInitScript(() => {
      (window as TestWindow).__xss = false;
      (globalThis as typeof globalThis & { __qsXss?: number }).__qsXss = undefined;
    });

    await page.goto('/en/tools/json-formatter');
    await dismissOnboarding(page);
    await page.evaluate(() => {
      const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
      if (!descriptor?.set) throw new Error('innerHTML setter unavailable');
      (window as TestWindow).__innerHTMLSinkUsed = false;
      Object.defineProperty(Element.prototype, 'innerHTML', {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set(value) {
          (window as TestWindow).__innerHTMLSinkUsed = true;
          descriptor.set?.call(this, value);
        },
      });
    });

    const payload = {
      '</span><script>globalThis.__qsXss=1</script>': '<img src=x onerror="globalThis.__qsXss=1">',
      svg: '<svg onload="globalThis.__qsXss=1"></svg>',
      punctuation: '&<>' + "'\"",
    };
    await page.getByPlaceholder(/paste your json here/i).fill(JSON.stringify(payload));
    await page.getByRole('button', { name: /format \/ prettify/i }).click();

    const output = page.locator('pre.tool-output');
    await expect(output.locator('img, svg, script')).toHaveCount(0);
    await expect(output).toContainText(JSON.stringify(payload, null, 2));
    await expect.poll(
      () => page.evaluate(() => (window as TestWindow).__xss)
    ).toBe(false);
    await expect.poll(
      () => page.evaluate(() => (globalThis as typeof globalThis & { __qsXss?: number }).__qsXss)
    ).toBeUndefined();
    await expect.poll(
      () => page.evaluate(() => (window as TestWindow).__innerHTMLSinkUsed)
    ).toBe(false);
  });

  test('decodes HTML entities in one non-DOM pass', async ({ page }) => {
    await page.addInitScript(() => {
      (window as TestWindow).__xss = false;
      (window as TestWindow).__innerHTMLSinkUsed = false;
      const descriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
      if (!descriptor?.set) throw new Error('innerHTML setter unavailable');
      Object.defineProperty(HTMLTextAreaElement.prototype, 'innerHTML', {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set(value) {
          (window as TestWindow).__innerHTMLSinkUsed = true;
          descriptor.set?.call(this, value);
        },
      });
    });

    await page.goto('/en/tools/text-encoder-decoder');
    await dismissOnboarding(page);
    await selectEncoding(page, /HTML Entities/i);
    await page.getByRole('tab', { name: /^decode$/i }).click();

    const input = page.getByPlaceholder(/enter text to encode\/decode/i);
    const output = page.locator('textarea[readonly]').first();
    const cases = [
      ['&lt;script&gt;alert(1)&lt;/script&gt;', '<script>alert(1)</script>'],
      ['&amp;lt;script&amp;gt;', '&lt;script&gt;'],
      ['&amp;quot;', '&quot;'],
      ['&#60;img src=x onerror=alert(1)&#62;', '<img src=x onerror=alert(1)>'],
      ['&#x3C;svg onload=alert(1)&#x3E;', '<svg onload=alert(1)>'],
      ['مرحبا بالعالم', 'مرحبا بالعالم'],
    ] as const;

    for (const [encoded, expected] of cases) {
      await input.fill(encoded);
      await expect(output).toHaveValue(expected);
    }
    await expect.poll(
      () => page.evaluate(() => (window as TestWindow).__xss)
    ).toBe(false);
    await expect.poll(
      () => page.evaluate(() => (window as TestWindow).__innerHTMLSinkUsed)
    ).toBe(false);
  });

  test('preserves URL and Unicode Base64 codec behavior', async ({ page }) => {
    await page.goto('/en/tools/text-encoder-decoder');
    await dismissOnboarding(page);
    const input = page.getByPlaceholder(/enter text to encode\/decode/i);
    const output = page.locator('textarea[readonly]').first();

    await selectEncoding(page, /URL Encoding/i);
    await page.getByRole('tab', { name: /^encode$/i }).click();
    const url = 'https://example.com/a path?x=1&y=2';
    await input.fill(url);
    const encodedUrl = encodeURIComponent(url);
    await expect(output).toHaveValue(encodedUrl);
    await page.getByRole('tab', { name: /^decode$/i }).click();
    await input.fill(encodedUrl);
    await expect(output).toHaveValue(url);

    await selectEncoding(page, /Base64/i);
    await page.getByRole('tab', { name: /^encode$/i }).click();
    const unicodeText = 'مرحبا 🌍';
    await input.fill(unicodeText);
    const encodedBase64 = await output.inputValue();
    expect(encodedBase64).not.toBe('');
    await page.getByRole('tab', { name: /^decode$/i }).click();
    await input.fill(encodedBase64);
    await expect(output).toHaveValue(unicodeText);
    await input.fill('%%%not-base64%%%');
    await expect(output).toHaveValue('Invalid input for decoding');
  });

  test('blog links use localized canonical same-origin paths', async ({ page }) => {
    await page.goto('/en/blog');
    await expect(page.getByRole('heading', { name: /QuickShed Tech Blog/i })).toBeVisible();

    const hrefs = await page.locator('article a').evaluateAll((links) =>
      links.map((link) => link.getAttribute('href'))
    );
    expect(hrefs).toContain('/en/blog/custom-pdf-tools-guide');
    expect(hrefs).toContain('/en/blog/welcome-to-quickshed');
    for (const href of hrefs) {
      expect(href).toMatch(/^\/en\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(new URL(href!, page.url()).origin).toBe(new URL(page.url()).origin);
    }
  });

  test('rejects malformed SSL certificate input instead of showing it as valid', async ({ page }) => {
    await page.goto('/en/tools/ssl-checker');
    const malformedPayloads = [
      'AA==',
      'ME4wTHN5bnRoZXRpYy1ub3QtYS1jZXJ0aWZpY2F0ZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      'ME8wSAIBATAAMAYMBGZha2UwIBcNMjYwOTAxMDAwMDAwWhgPMjAyNjEwMDEwMDAwMDBaMAYMBGZha2UwD2Zha2UtcHVibGljLWtleTAAAwEA',
    ];

    for (const payload of malformedPayloads) {
      await page.getByPlaceholder(/Paste your SSL certificate in PEM format/i).fill([
        '-----BEGIN CERTIFICATE-----',
        payload,
        '-----END CERTIFICATE-----',
      ].join('\n'));
      await page.getByRole('button', { name: /parse certificate/i }).click();

      await expect(page.getByText(/Could not parse the certificate/i)).toBeVisible();
      await expect(page.getByText(/^Valid$/)).toHaveCount(0);
    }

    const notYetValidPayload = 'MFAwRQIBATADBgEqMAcxBTADDAFYMB4XDTQ5MDEwMTAwMDAwMFoXDTQ5MDEwMjAwMDAwMFowBzEFMAMMAVgwCTADBgEqAwIAADADBgEqAwIAAA==';
    await page.getByPlaceholder(/Paste your SSL certificate in PEM format/i).fill([
      '-----BEGIN CERTIFICATE-----',
      notYetValidPayload,
      '-----END CERTIFICATE-----',
    ].join('\n'));
    await page.getByRole('button', { name: /parse certificate/i }).click();

    await expect(page.getByText(/Not Yet Valid/i)).toBeVisible();
    await expect(page.getByText(/^Valid$/)).toHaveCount(0);
  });

  test('publishes indexable category and blog routes in the sitemap', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBe(true);
    const sitemap = await response.text();

    for (const path of [
      '/en/category',
      '/ar/category',
      '/en/blog',
      '/ar/blog',
      '/en/blog/custom-pdf-tools-guide',
      '/ar/blog/custom-pdf-tools-guide',
      '/en/blog/welcome-to-quickshed',
      '/ar/blog/welcome-to-quickshed',
    ]) {
      expect(sitemap).toContain(`<loc>https://quickshed.vercel.app${path}</loc>`);
    }
  });

  test('publishes reciprocal hreflang and social images for localized blog posts', async ({ page }) => {
    for (const locale of ['en', 'ar']) {
      for (const slug of ['custom-pdf-tools-guide', 'welcome-to-quickshed']) {
        await page.goto(`/${locale}/blog/${slug}`);
        const alternates = await page.locator('link[rel="alternate"][hreflang]').evaluateAll((links) =>
          Object.fromEntries(links.map((link) => [link.getAttribute('hreflang'), link.getAttribute('href')]))
        );
        expect(alternates).toEqual({
          en: `https://quickshed.vercel.app/en/blog/${slug}`,
          ar: `https://quickshed.vercel.app/ar/blog/${slug}`,
        });
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og-image\.png$/);
        await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /og-image\.png$/);
      }
    }
  });

  test('keeps the default social image on every public page family', async ({ page }) => {
    for (const path of [
      '/en',
      '/en/all-tools',
      '/en/category',
      '/en/category/developer-tools',
      '/en/tools/json-formatter',
      '/en/blog',
      '/en/privacy',
      '/en/terms',
    ]) {
      await page.goto(path);
      await expect(page.locator('meta[property="og:image"]'), path).toHaveAttribute('content', /og-image\.png$/);
      await expect(page.locator('meta[name="twitter:image"]'), path).toHaveAttribute('content', /og-image\.png$/);
    }
  });

  test('opens command palette with Ctrl+K', async ({ page }) => {
    await page.goto('/en');
    await dismissOnboarding(page);

    await page.keyboard.press('Control+K');

    await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
  });

  test('renders the home page on a mobile viewport', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile viewport coverage runs in the mobile-chromium project');

    await page.goto('/en');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { name: /privacy-first toolbox/i })).toBeVisible();
    await expect(page.getByRole('main').getByText(/90\+ free tools/i)).toBeVisible();
  });

  test('keeps navigation safe when service workers are unavailable', async ({ page, context }) => {
    await context.route('**/sw.js', (route) => route.fulfill({ status: 404, body: '' }));

    await page.goto('/en/tools/json-formatter');

    await expect(page).toHaveURL(/\/en\/tools\/json-formatter$/);
    await expect(page.getByRole('main').getByText(/JSON Formatter/i).first()).toBeVisible();
  });

  test('shortens to a same-browser hash route under the localized tool path', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            (window as TestWindow).__copiedText = text;
          },
        },
      });
    });

    await page.goto('/en/tools/url-shortener');
    await dismissOnboarding(page);

    await page
      .getByPlaceholder(/https:\/\/example\.com\/very\/long\/url/)
      .fill('http://127.0.0.1:7125/en?short-target=1');
    await page.getByPlaceholder('my-link').fill('mytest');
    await page.getByRole('button', { name: /^shorten$/i }).click();

    await expect(
      page.getByText(/\/en\/tools\/url-shortener#s\/mytest/).first()
    ).toBeVisible();

    await page.getByRole('button', { name: /^copy$/i }).click();
    await expect.poll(() =>
      page.evaluate(() => (window as TestWindow).__copiedText)
    ).toBe('http://127.0.0.1:7125/en/tools/url-shortener#s/mytest');
  });

  test('resolves a same-browser short link to an explicit CTA without auto-navigating', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'quickshed-url-shortener',
        JSON.stringify([
          {
            alias: 'demo',
            original: 'http://127.0.0.1:7125/en?short-target=1',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        ])
      );
    });

    await page.goto('/en/tools/url-shortener#s/demo');

    // The hash resolves to an explicit user-action CTA (rendered above the
    // stored-links list, hence .first()) instead of auto-navigating.
    const cta = page.getByRole('link', { name: /open original url/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /short-target=1/);
    await expect(cta).toHaveAttribute('rel', /noopener/);
    await expect(cta).toHaveAttribute('rel', /noreferrer/);

    // No automatic external navigation occurred.
    await expect(page).toHaveURL(/\/en\/tools\/url-shortener/);
    await expect(page).not.toHaveURL(/short-target=1/);

    // The explicit CTA opens the stored target.
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      cta.click(),
    ]);
    await expect(popup).toHaveURL(/short-target=1/);
  });

  test('does not navigate from an unsafe stored short link', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'quickshed-url-shortener',
        JSON.stringify([
          {
            alias: 'demo',
            original: 'javascript:alert(1)',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        ])
      );
    });

    await page.goto('/en/tools/url-shortener#s/demo');

    await expect(page).toHaveURL(/\/en\/tools\/url-shortener/);
    await expect(
      page.getByText(/Short link not found or unavailable in this browser/i)
    ).toBeVisible();
  });
});

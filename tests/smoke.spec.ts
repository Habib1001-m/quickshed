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

const VALID_CERTIFICATE_DER_BASE64 = 'MIIDtTCCAp2gAwIBAgIESjssHTANBgkqhkiG9w0BAQsFADByMQswCQYDVQQGEwJVUzEXMBUGA1UECgwOUXVpY2tTaGVkIFRlc3QxCzAJBgNVBAsMAlFBMRgwFgYDVQQDDA9maXh0dXJlLmV4YW1wbGUxIzAhBgkqhkiG9w0BCQEWFGZpeHR1cmVAZXhhbXBsZS50ZXN0MB4XDTI2MDkwMTE4MzkxNFoXDTM2MDgyOTE4MzkxNFowcjELMAkGA1UEBhMCVVMxFzAVBgNVBAoMDlF1aWNrU2hlZCBUZXN0MQswCQYDVQQLDAJRQTEYMBYGA1UEAwwPZml4dHVyZS5leGFtcGxlMSMwIQYJKoZIhvcNAQkBFhRmaXh0dXJlQGV4YW1wbGUudGVzdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANlDCMHZOUMQEnwxbFPCM3uMMyZoQu8PzrwbN2dbnFNK81B89VIB39+VzxMLYfachiBGw8De9+Du77rNG/8TrblPXaETHRG5vC0YZOtFT4JnAACTkRnIjAaNivdXk4GMOVo2ubwE7bNMBXJwEbNAjaYLB7H3xVW7ZGTu7wei5d3fN+MgI8y4jrcg479navXl4Ma4rauC8gLcK1sRJ4y+hgEsJ14lLDL5Sdn4LiMfgeQhkVLn+ZcVZAFpHfIaMJDAq9gAscRN+8KXglB4XkbSyz5lzNSMspJpQKS8zx+FJ7IHEfpYHlEOnRhWr4VzdGK9oox42ITnTCBg/fkfQuUY//0CAwEAAaNTMFEwHQYDVR0OBBYEFLk+Hs3a0ZJJiZ5r+VO8lYpW8v9XMB8GA1UdIwQYMBaAFLk+Hs3a0ZJJiZ5r+VO8lYpW8v9XMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAJNzdEsO/9dI/G4I6mOl6Yr7mAlRzerK8saKZiAQTABwuxxwtWt6KzHMd30x8S3hnUJlTctJSupa4oJzBu/5VZmBpPNKtU+jK9aIWU6tel9DD9FW0c1iyuKGrTIukbofpT2Rb6itBFWz8ZziJkR6+mZ00K/OGYKff3XNJh0tftmpLJ04rBsk2l1IfXlvWFNivb4i9c4OT1DUIXhXQ02A81KDUC3AUiL/oek9mBBdCRgFBVEmWW1gQTdfsBv1tIJv/WypnHUEj5cQDP1kspBWWb7VPYg++uBJfPHwi5Riko6AO7TOVK05bgmq6UX/jU+FE1T3TdFjOq8SN9HbC7Dp1Yc=';
const VALID_CERTIFICATE_EXPECTED = {
  subject: 'C=US, O=QuickShed Test, OU=QA, CN=fixture.example, emailAddress=fixture@example.test',
  issuer: 'C=US, O=QuickShed Test, OU=QA, CN=fixture.example, emailAddress=fixture@example.test',
  serial: '4A3B2C1D',
  algorithm: 'sha256WithRSAEncryption',
  notBefore: '2026-09-01T18:39:14Z',
  notAfter: '2036-08-29T18:39:14Z',
};

function makeFutureCertificate(base64: string): string {
  const der = Buffer.from(base64, 'base64').toString('latin1');
  const future = der.replace('260901183914Z', '490101000000Z').replace('360829183914Z', '490201000000Z');
  if (future === der) throw new Error('certificate validity fixture was not changed');
  return Buffer.from(future, 'latin1').toString('base64');
}

function mutateCertificate(base64: string, mutate: (der: Buffer) => void): string {
  const der = Buffer.from(base64, 'base64');
  mutate(der);
  return der.toString('base64');
}

function makeNonCanonicalOidCertificate(base64: string): string {
  return mutateCertificate(base64, (der) => {
    const marker = Buffer.from([0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x0b]);
    let offset = 0;
    let replacements = 0;
    while ((offset = der.indexOf(marker, offset)) !== -1) {
      der[offset + 3] = 0x80;
      replacements++;
      offset += marker.length;
    }
    if (replacements !== 2) throw new Error('expected two signature algorithm OIDs');
  });
}

function makePaddedSignatureCertificate(base64: string): string {
  return mutateCertificate(base64, (der) => {
    const signatureOffset = der.lastIndexOf(Buffer.from([0x03, 0x82]));
    if (signatureOffset < 0) throw new Error('signature BIT STRING not found');
    der[signatureOffset + 4] = 1;
  });
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

  test('rejects out-of-range Cron fields instead of treating them as valid', async ({ page }) => {
    await page.goto('/en/tools/cron-expression-parser');
    const invalidExpressions = [
      '99 * * * *',
      '* 24 * * *',
      '* * 0 * *',
      '* * * 13 *',
      '* * * * 7',
    ];

    for (const expression of invalidExpressions) {
      await page.getByPlaceholder('e.g. */5 * * * *').fill(expression);
      await expect(page.getByText(/Invalid cron expression/i), expression).toBeVisible();
      await expect(page.getByText(/Next 5 Executions/i), expression).toHaveCount(0);
    }
  });

  test('parses X.509 fields from a genuine DER certificate', async ({ page }) => {
    await page.goto('/en/tools/ssl-checker');
    await page.getByPlaceholder(/Paste your SSL certificate in PEM format/i).fill([
      '-----BEGIN CERTIFICATE-----',
      VALID_CERTIFICATE_DER_BASE64,
      '-----END CERTIFICATE-----',
    ].join('\n'));
    await page.getByRole('button', { name: /parse certificate/i }).click();

    await expect(page.getByText(VALID_CERTIFICATE_EXPECTED.subject, { exact: true })).toHaveCount(2);
    await expect(page.getByText(VALID_CERTIFICATE_EXPECTED.serial, { exact: true })).toBeVisible();
    await expect(page.getByText(/^Signature Algorithm:/).locator('..')).toContainText(VALID_CERTIFICATE_EXPECTED.algorithm);
    await expect(page.getByText(/^Valid From:/).locator('..')).toContainText(new Date(VALID_CERTIFICATE_EXPECTED.notBefore).toLocaleDateString('en-US'));
    await expect(page.getByText(/^Valid To:/).locator('..')).toContainText(new Date(VALID_CERTIFICATE_EXPECTED.notAfter).toLocaleDateString('en-US'));
    await expect(page.getByText(/^Valid$/)).toHaveCount(1);
  });

  test('rejects malformed SSL certificate input instead of showing it as valid', async ({ page }) => {
    await page.goto('/en/tools/ssl-checker');
    const malformedPayloads = [
      'AA==',
      'ME4wTHN5bnRoZXRpYy1ub3QtYS1jZXJ0aWZpY2F0ZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=',
      'ME8wSAIBATAAMAYMBGZha2UwIBcNMjYwOTAxMDAwMDAwWhgPMjAyNjEwMDEwMDAwMDBaMAYMBGZha2UwD2Zha2UtcHVibGljLWtleTAAAwEA',
      makeNonCanonicalOidCertificate(VALID_CERTIFICATE_DER_BASE64),
      makePaddedSignatureCertificate(VALID_CERTIFICATE_DER_BASE64),
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

    // Structurally valid DER with a future validity window; its signature is intentionally not verified by this parser.
    const notYetValidPayload = makeFutureCertificate(VALID_CERTIFICATE_DER_BASE64);
    await page.getByPlaceholder(/Paste your SSL certificate in PEM format/i).fill([
      '-----BEGIN CERTIFICATE-----',
      notYetValidPayload,
      '-----END CERTIFICATE-----',
    ].join('\n'));
    await page.getByRole('button', { name: /parse certificate/i }).click();

    await expect(page.getByText(/Not Yet Valid/i)).toBeVisible();
    await expect(page.getByText(/^Valid$/)).toHaveCount(0);

    const tooManyCertificates = Array.from({ length: 33 }, () => [
      '-----BEGIN CERTIFICATE-----',
      VALID_CERTIFICATE_DER_BASE64,
      '-----END CERTIFICATE-----',
    ].join('\n')).join('\n');
    await page.getByPlaceholder(/Paste your SSL certificate in PEM format/i).fill(tooManyCertificates);
    await page.getByRole('button', { name: /parse certificate/i }).click();
    await expect(page.getByText(/Could not parse the certificate/i)).toBeVisible();
  });

  test('publishes indexable category and blog routes in the sitemap', async ({ request }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.ok()).toBe(true);
    const sitemap = await response.text();
    expect(sitemap).not.toContain('<lastmod>');

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

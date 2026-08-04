import { expect, test, type Page } from '@playwright/test';
import toolsIndex from '../content/tools-index.json';
import fixtureManifest from './fixtures/tool-validation/fixture-manifest.json';

type Locale = 'en' | 'ar';
type T014Window = Window & {
  __t014DisclosureMountedBeforeConsent?: boolean;
  __t014ConsentClicked?: boolean;
  __t014DisclosureObserver?: MutationObserver;
};

const DISCLOSURE_COPY = {
  en: {
    direction: 'ltr',
    title: 'Before you use this tool',
    notNow: 'Not now',
    privacy: {
      local: 'Processing stays in your browser. Your data is not sent anywhere.',
      'file-only': 'Files you select are processed in your browser and are not uploaded.',
      storage: 'Processing stays in your browser, and data may be saved in this browser on this device.',
    },
    offline: 'Works fully without an internet connection.',
    retention: {
      none: 'Nothing is kept beyond the active processing step.',
      'browser-storage': 'Data may remain in this browser across sessions.',
    },
  },
  ar: {
    direction: 'rtl',
    title: 'قبل استخدام هذه الأداة',
    notNow: 'ليس الآن',
    privacy: {
      local: 'تتم المعالجة داخل متصفحك. لا يتم إرسال بياناتك إلى أي مكان.',
      'file-only': 'تتم معالجة الملفات التي تختارها داخل متصفحك ولا يتم رفعها.',
      storage: 'تتم المعالجة داخل متصفحك، وقد تُحفظ البيانات في متصفح هذا الجهاز.',
    },
    offline: 'تعمل بالكامل دون اتصال بالإنترنت.',
    retention: {
      none: 'لا يتم الاحتفاظ بأي بيانات بعد خطوة المعالجة الحالية.',
      'browser-storage': 'قد تبقى البيانات في هذا المتصفح عبر الجلسات.',
    },
  },
} as const;

const TOOL_METADATA = new Map(toolsIndex.map((tool) => [tool.id, tool]));

function observeNetwork(page: Page) {
  const requests: Array<{ url: string; body: string | null }> = [];
  const failedRequests: string[] = [];
  const webSocketUrls: string[] = [];
  const webSocketFrames: Array<{ url: string; data: string }> = [];

  page.on('request', (request) => {
    if (/^https?:/i.test(request.url())) {
      requests.push({ url: request.url(), body: request.postData() });
    }
  });
  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()}`);
  });
  page.on('websocket', (webSocket) => {
    webSocketUrls.push(webSocket.url());
    webSocket.on('framesent', (data) => {
      webSocketFrames.push({ url: webSocket.url(), data: String(data) });
    });
  });

  return { requests, failedRequests, webSocketUrls, webSocketFrames };
}

function assertNoObservedHttpSentinelLeak(
  page: Page,
  observation: ReturnType<typeof observeNetwork>,
  sentinel: string,
) {
  const pageOrigin = new URL(page.url()).origin;
  const externalRequests = observation.requests.filter(
    ({ url }) => new URL(url).origin !== pageOrigin,
  );
  const sentinelLeaks = observation.requests.filter(
    ({ url, body }) => url.includes(sentinel) || body?.includes(sentinel),
  );
  const externalWebSockets = observation.webSocketUrls.filter(
    (url) => new URL(url).origin !== pageOrigin,
  );
  const sentinelWebSocketLeaks = observation.webSocketFrames.filter(
    ({ data }) => data.includes(sentinel),
  );

  expect(externalRequests, 'observed flow must not make external HTTP(S) requests').toEqual([]);
  expect(externalWebSockets, 'observed flow must not open external WebSockets').toEqual([]);
  expect(sentinelLeaks, 'the sentinel must not appear in observed HTTP(S) URL/body').toEqual([]);
  expect(sentinelWebSocketLeaks, 'the sentinel must not appear in observed WebSocket frames').toEqual([]);
  expect(
    observation.failedRequests.filter((request) => request.includes(sentinel)),
    'a failed request must not carry the sentinel either',
  ).toEqual([]);
}

async function startDisclosureOrderWatch(page: Page) {
  await page.evaluate(() => {
    const observedWindow = window as T014Window;
    observedWindow.__t014DisclosureMountedBeforeConsent = false;
    observedWindow.__t014ConsentClicked = false;
    const continueButton = document.querySelector('[data-testid="tool-disclosure-continue"]');
    continueButton?.addEventListener(
      'click',
      () => {
        observedWindow.__t014ConsentClicked = true;
      },
      { capture: true, once: true },
    );
    observedWindow.__t014DisclosureObserver = new MutationObserver((records) => {
      if (observedWindow.__t014ConsentClicked) return;
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (
            node instanceof Element &&
            (node.matches('[data-testid="tool-use-content"]') ||
              node.querySelector('[data-testid="tool-use-content"]'))
          ) {
            observedWindow.__t014DisclosureMountedBeforeConsent = true;
          }
        }
      }
    });
    observedWindow.__t014DisclosureObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });

  await expect(page.getByTestId('tool-use-content')).toHaveCount(0);
  await page.waitForTimeout(250);
  expect(
    await page.evaluate(() => (window as T014Window).__t014DisclosureMountedBeforeConsent === true),
  ).toBe(false);
}

async function finishDisclosureOrderWatch(page: Page) {
  const mountedBeforeConsent = await page.evaluate(() => {
    const observedWindow = window as T014Window;
    observedWindow.__t014DisclosureObserver?.disconnect();
    return observedWindow.__t014DisclosureMountedBeforeConsent === true;
  });
  expect(mountedBeforeConsent).toBe(false);
}

async function stopDisclosureOrderWatch(page: Page) {
  await page.evaluate(() => {
    (window as T014Window).__t014DisclosureObserver?.disconnect();
  });
}

async function preparePage(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
    localStorage.removeItem('quickshed-notes');
  });
}

async function assertDisclosure(
  page: Page,
  locale: Locale,
  toolId: string,
) {
  const metadata = TOOL_METADATA.get(toolId);
  if (!metadata) throw new Error(`Missing metadata for ${toolId}`);

  const copy = DISCLOSURE_COPY[locale];
  const disclosure = page.getByTestId('tool-use-disclosure');
  await expect(disclosure).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('dir', copy.direction);
  await expect(disclosure).toHaveAttribute('dir', copy.direction);
  await expect(page.getByTestId('tool-use-content')).toHaveCount(0);
  await expect(disclosure.getByRole('heading', { name: copy.title, exact: true })).toBeVisible();
  await expect(disclosure.getByTestId('tool-disclosure-details')).toContainText(
    copy.privacy[metadata.privacy as keyof typeof copy.privacy],
  );
  await expect(disclosure.getByTestId('tool-disclosure-details')).toContainText(copy.offline);
  await expect(
    disclosure.getByTestId('tool-disclosure-details'),
  ).toContainText(copy.retention[metadata.retention as keyof typeof copy.retention]);
}

const JOURNEYS = [
  {
    id: 'json-formatter',
    async waitForReady(page: Page) {
      await page.getByPlaceholder(/paste your json here|الصق json هنا/i).waitFor();
    },
    async exercise(page: Page, sentinel: string) {
      await page.getByPlaceholder(/paste your json here|الصق json هنا/i).fill(
        JSON.stringify({ sentinel }),
      );
      await page.getByRole('button', { name: /format \/ prettify|تنسيق \/ تجميل/i }).click();
      await expect(page.locator('pre.tool-output')).toContainText(sentinel);
    },
  },
  {
    id: 'base64-encoder',
    async waitForReady(page: Page) {
      await page.getByRole('tab', { name: /file|ملف/i }).click();
      await page.locator('input[type="file"]').waitFor({ state: 'attached' });
    },
    async exercise(page: Page, sentinel: string) {
      await page.locator('input[type="file"]').setInputFiles({
        name: `${sentinel}.txt`,
        mimeType: 'text/plain',
        buffer: Buffer.from(sentinel),
      });
      await expect(page.getByText(new RegExp(`${sentinel}\\.txt`))).toBeVisible();
      await expect(page.locator('textarea.tool-output')).not.toHaveValue('');
    },
  },
  {
    id: 'note-organizer',
    async waitForReady(page: Page) {
      await page.getByRole('button', { name: /new|جديد/i }).waitFor();
    },
    async exercise(page: Page, sentinel: string) {
      await page.getByRole('button', { name: /new|جديد/i }).click();
      await page.getByPlaceholder(/note title|عنوان الملاحظة/i).fill(sentinel);
      await page.getByPlaceholder(/write your note|اكتب ملاحظتك/i).fill(`${sentinel} content`);
      await page.getByRole('button', { name: /create|إنشاء/i }).click();
      await expect(page.getByText(sentinel, { exact: true })).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => localStorage.getItem('quickshed-notes') ?? ''))
        .toContain(sentinel);
    },
  },
] as const;

for (const locale of ['en', 'ar'] as const) {
  for (const journey of JOURNEYS) {
    test(`T014 ${locale} ${journey.id} discloses before use and keeps observed flow local offline`, async ({
      page,
      context,
      browserName,
    }) => {
      test.skip(
        browserName === 'webkit' &&
          (journey.id === 'base64-encoder' || journey.id === 'note-organizer'),
        'WebKit does not complete these stateful file/storage interactions after the context is forced offline; Chromium and Firefox cover the required paths.',
      );
      const observation = observeNetwork(page);
      await preparePage(page);
      await page.goto(`/${locale}/tools/${journey.id}`);

      await assertDisclosure(page, locale, journey.id);
      await startDisclosureOrderWatch(page);
      await page.getByTestId('tool-disclosure-continue').click();
      await finishDisclosureOrderWatch(page);
      await page.getByTestId('tool-use-content').waitFor({ state: 'visible' });
      await journey.waitForReady(page);

      // Warm the dynamic tool chunk while online, then prove its core flow
      // remains usable without network access. Cold offline boot is outside
      // this task because the service worker intentionally does not cache
      // navigation or Next chunks.
      await context.setOffline(true);
      const sentinel = `T014-${locale}-${journey.id}-sentinel`;
      await journey.exercise(page, sentinel);
      await context.setOffline(false);
      await page.waitForTimeout(300);

      assertNoObservedHttpSentinelLeak(page, observation, sentinel);
      await stopDisclosureOrderWatch(page);
    });
  }

  test(`T014 ${locale} cancel keeps the tool unmounted`, async ({ page }) => {
    const observation = observeNetwork(page);
    await preparePage(page);
    await page.goto(`/${locale}/tools/json-formatter`);

    await assertDisclosure(page, locale, 'json-formatter');
    await page
      .getByTestId('tool-use-disclosure')
      .getByRole('button', { name: DISCLOSURE_COPY[locale].notNow, exact: true })
      .click();

    await expect(page).toHaveURL(new RegExp(`/${locale}/?$`));
    await expect(page.getByTestId('tool-use-content')).toHaveCount(0);
    expect(observation.failedRequests).toEqual([]);
  });
}

test('T014 isolated API fixture blocks transmission until explicit consent', async ({ page }) => {
  const apiFixture = fixtureManifest.positive.find(
    (fixture) => fixture.id === 'privacy-api-full-none-low',
  ) as unknown as { set: Record<string, unknown> } | undefined;
  if (!apiFixture) throw new Error('Missing T010 API fixture');

  const networkEgress = apiFixture.set['evidence.networkEgress'] as {
    endpoint: string;
    data: string;
    purpose: string;
  };
  expect(apiFixture.set.privacy).toBe('api');
  expect(networkEgress.endpoint).toMatch(/^https:\/\//);
  expect(networkEgress.data).toBeTruthy();
  expect(networkEgress.purpose).toBeTruthy();

  const transmissions: string[] = [];
  await page.route(networkEgress.endpoint, async (route) => {
    transmissions.push(route.request().postData() ?? '');
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.setContent(`
    <main>
      <section data-testid="t014-api-disclosure" aria-live="polite">
        <h1>Before you use this tool</h1>
        <p>Review the external destination and consent before continuing.</p>
        <label>
          <input data-testid="t014-api-consent" type="checkbox">
          I understand that the data will be sent to an external service.
        </label>
        <button data-testid="t014-api-continue" type="button" disabled>Agree and continue</button>
      </section>
      <section data-testid="t014-api-content" hidden>
        <button data-testid="t014-api-send" type="button">Send sample data</button>
        <output data-testid="t014-api-status">blocked</output>
      </section>
      <script>
        const consent = document.querySelector('[data-testid="t014-api-consent"]');
        const continueButton = document.querySelector('[data-testid="t014-api-continue"]');
        const disclosure = document.querySelector('[data-testid="t014-api-disclosure"]');
        const content = document.querySelector('[data-testid="t014-api-content"]');
        const status = document.querySelector('[data-testid="t014-api-status"]');
        const send = document.querySelector('[data-testid="t014-api-send"]');
        consent.addEventListener('change', () => { continueButton.disabled = !consent.checked; });
        continueButton.addEventListener('click', () => {
          if (continueButton.disabled) return;
          disclosure.hidden = true;
          content.hidden = false;
          status.textContent = 'consented';
        });
        send.addEventListener('click', async () => {
          await fetch(${JSON.stringify(networkEgress.endpoint)}, {
            method: 'POST',
            headers: { 'content-type': 'text/plain' },
            body: ${JSON.stringify(networkEgress.data)},
          });
          status.textContent = 'sent';
        });
      </script>
    </main>
  `);

  await expect(page.getByTestId('t014-api-continue')).toBeDisabled();
  await expect(page.getByTestId('t014-api-content')).toBeHidden();
  expect(transmissions).toEqual([]);

  await page.getByTestId('t014-api-consent').check();
  await page.getByTestId('t014-api-continue').click();
  await expect(page.getByTestId('t014-api-status')).toHaveText('consented');
  expect(transmissions).toEqual([]);

  await page.getByTestId('t014-api-send').click();
  await expect(page.getByTestId('t014-api-status')).toHaveText('sent');
  await expect.poll(() => transmissions.length).toBe(1);
  expect(transmissions[0]).toContain(networkEgress.data);
});

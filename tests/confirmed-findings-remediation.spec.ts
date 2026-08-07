import { expect, test } from '@playwright/test';
import { continuePastToolDisclosure } from './helpers/tool-disclosure';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
  });
});

test('does not show false clipboard success when both copy paths fail', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error('clipboard denied');
        },
      },
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: () => false,
    });
  });

  await page.goto('/en/tools/remove-duplicates');
  await continuePastToolDisclosure(page);
  await page.getByPlaceholder(/enter one item per line/i).fill('one\none');
  await page.getByRole('button', { name: /^copy$/i }).click();

  await expect(page.getByText('Copied!', { exact: true })).toHaveCount(0);
});

test('makes a file dropzone keyboard operable', async ({ page }) => {
  await page.goto('/en/tools/hash-generator');
  await continuePastToolDisclosure(page);
  await page.getByRole('button', { name: 'File', exact: true }).click();

  const dropzone = page.getByRole('button', { name: /drag & drop a file here/i });
  await expect(dropzone).toBeVisible();
  await dropzone.focus();
  await expect(dropzone).toBeFocused();

  const fileChooser = page.waitForEvent('filechooser');
  await dropzone.press('Enter');
  await fileChooser;
});

test('supports keyboard crop selection and localized crop output', async ({ page }) => {
  await page.goto('/ar/tools/image-cropper');
  await continuePastToolDisclosure(page);

  await page.locator('input[type="file"]').setInputFiles({
    name: 'sample.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><rect width="20" height="20" fill="seagreen"/></svg>'),
  });

  const canvas = page.locator('canvas[aria-label="منطقة قص الصورة"]');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute('tabindex', '0');
  await canvas.focus();
  await canvas.press('Enter');
  await canvas.press('Shift+ArrowRight');

  const cropButton = page.getByRole('button', { name: /^قص$/ });
  await expect(cropButton).toBeEnabled();
  await cropButton.click();
  await expect(page.getByText('نتيجة القص', { exact: true })).toBeVisible();
  await expect(page.getByAltText('الصورة المقصوصة')).toBeVisible();
});

test('keeps tool cards free of nested interactive controls', async ({ page }) => {
  await page.goto('/en/all-tools');

  const card = page.locator('[data-tool-card]').first();
  await expect(card).toBeVisible();
  await expect(card.locator('[role="button"] button')).toHaveCount(0);
  await expect(card.getByRole('button').first()).toBeVisible();
});

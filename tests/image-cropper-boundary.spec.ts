import { expect, test, type Page } from '@playwright/test';
import { continuePastToolDisclosure } from './helpers/tool-disclosure';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
  });
});

async function uploadImage(page: Page, width: number, height: number, overlay = '') {
  await page.locator('input[type="file"]').setInputFiles({
    name: 'boundary.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="seagreen"/>${overlay}</svg>`,
    ),
  });
  await expect(page.locator('canvas[aria-label="Image crop area"]')).toBeVisible();
}

async function selectAspectRatio(page: Page, label: string) {
  await page.getByRole('combobox', { name: 'Aspect Ratio' }).click();
  await page.getByRole('option', { name: label, exact: true }).click();
}

async function readCroppedResult(page: Page) {
  const result = page.getByAltText('Cropped');
  await expect(result).toBeVisible();
  await expect
    .poll(() => result.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  return result.evaluate(async (element) => {
    const image = element as HTMLImageElement;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create a result probe canvas');
    context.drawImage(image, 0, 0);
    const pixel = context.getImageData(
      Math.max(0, image.naturalWidth - 5),
      Math.max(0, image.naturalHeight - 5),
      1,
      1,
    ).data;
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
      bottomRight: Array.from(pixel),
    };
  });
}

async function expectCroppedRatio(page: Page, expected: number) {
  const dimensions = await readCroppedResult(page);
  expect(dimensions.width).toBeGreaterThanOrEqual(5);
  expect(dimensions.height).toBeGreaterThanOrEqual(5);
  expect(Math.abs(dimensions.width / dimensions.height - expected)).toBeLessThan(0.02);
}

test('keeps a 16:9 pointer selection proportional at the lower image boundary', async ({ page }) => {
  await page.goto('/en/tools/image-cropper');
  await continuePastToolDisclosure(page);
  await uploadImage(
    page,
    1600,
    900,
    '<rect x="280" y="840" width="40" height="60" fill="crimson"/>',
  );
  await selectAspectRatio(page, '16:9');

  const canvas = page.locator('canvas[aria-label="Image crop area"]');
  await canvas.scrollIntoViewIfNeeded();
  const quickAccessBar = page.locator('.quick-access-bar');
  const quickAccessBox = await quickAccessBar.boundingBox();
  if (quickAccessBox) {
    await page.evaluate((offset) => {
      document.documentElement.style.scrollBehavior = 'auto';
      document.body.style.scrollBehavior = 'auto';
      window.scrollBy(0, offset);
    }, quickAccessBox.height + 20);
  }
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  await page.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.9);
  await page.mouse.down();
  // Pointer capture keeps delivering the move after the pointer crosses the
  // canvas edge, exercising the image-boundary clamp on every viewport.
  await page.mouse.move(box.x + box.width + 20, box.y + box.height + 20);
  await page.mouse.up();
  await page.getByRole('button', { name: 'Crop', exact: true }).click();

  const result = await readCroppedResult(page);
  expect(result.width).toBeGreaterThanOrEqual(150);
  expect(result.width).toBeLessThanOrEqual(170);
  expect(result.height).toBeGreaterThanOrEqual(80);
  expect(result.height).toBeLessThanOrEqual(100);
  expect(Math.abs(result.width / result.height - 16 / 9)).toBeLessThan(0.02);
  expect(result.bottomRight[0]).toBeGreaterThan(200);
  expect(result.bottomRight[1]).toBeLessThan(80);
  expect(result.bottomRight[2]).toBeLessThan(80);
  expect(result.bottomRight[3]).toBeGreaterThan(200);
});

test('keeps a 16:9 keyboard resize proportional at the image boundary', async ({ page }) => {
  await page.goto('/en/tools/image-cropper');
  await continuePastToolDisclosure(page);
  await uploadImage(page, 1000, 1000);
  await selectAspectRatio(page, '16:9');

  const canvas = page.locator('canvas[aria-label="Image crop area"]');
  await canvas.focus();
  await canvas.press('Enter');
  for (let i = 0; i < 150; i += 1) {
    await canvas.press('Shift+ArrowDown');
  }
  await page.getByRole('button', { name: 'Crop', exact: true }).click();

  await expectCroppedRatio(page, 16 / 9);
});

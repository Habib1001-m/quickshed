import { expect, test } from '@playwright/test';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const KNOWN_TEXT = 'QuickShed PDF text extraction regression';

async function createPdfFixture() {
  const document = await PDFDocument.create();
  const page = document.addPage([600, 200]);
  const font = await document.embedFont(StandardFonts.Helvetica);
  page.drawText(KNOWN_TEXT, { x: 24, y: 96, size: 18, font });
  return Buffer.from(await document.save());
}

test('extracts known text through the PdfToText upload path', async ({ page }) => {
  const pdfRuntimeErrors: string[] = [];
  const isPdfRuntimeError = (message: string) => /pdfjs|pdf\.mjs|fake worker|worker/i.test(message);

  page.on('pageerror', (error) => {
    if (isPdfRuntimeError(error.message)) pdfRuntimeErrors.push(error.message);
  });
  page.on('console', (message) => {
    if (message.type() === 'error' && isPdfRuntimeError(message.text())) {
      pdfRuntimeErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
  });
  await page.goto('/en/tools/pdf-to-text');

  const dropzone = page.getByText(/Drag & drop a PDF file or click to upload/i);
  await expect(dropzone).toBeVisible();
  const fileChooserPromise = page.waitForEvent('filechooser');
  await dropzone.click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles({
    name: 'known-text.pdf',
    mimeType: 'application/pdf',
    buffer: await createPdfFixture(),
  });

  await expect(page.locator('pre.tool-output').first()).toContainText(KNOWN_TEXT);
  expect(pdfRuntimeErrors).toEqual([]);
});

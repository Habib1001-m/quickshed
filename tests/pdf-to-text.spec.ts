import { PDFDocument, StandardFonts } from 'pdf-lib';
import { expect, test, type Page } from '@playwright/test';
import { continuePastToolDisclosure } from './helpers/tool-disclosure';

type Locale = 'en' | 'ar';

const COPY = {
  en: {
    dropzone: 'Drag & drop a PDF file or click to upload',
    extractedText: 'QuickShed PDF.js upgrade fixture',
  },
  ar: {
    dropzone: 'اسحب وأسقط ملف PDF أو انقر للرفع',
    extractedText: 'QuickShed PDF.js upgrade fixture',
  },
} as const satisfies Record<Locale, Record<string, string>>;

async function createPdfFixture() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const page = pdf.addPage([420, 180]);
  page.drawText(COPY.en.extractedText, {
    x: 36,
    y: 100,
    font,
    size: 18,
  });
  return Array.from(await pdf.save());
}

async function dispatchFileDrop(page: Page, dropzoneLabel: string, bytes: number[]) {
  await page.getByRole('button', { name: dropzoneLabel, exact: true }).evaluate(
    (element, fileBytes) => {
      const browserFile = new File(
        [new Uint8Array(fileBytes)],
        'pdfjs-upgrade-fixture.pdf',
        { type: 'application/pdf' },
      );
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(browserFile);
      element.dispatchEvent(
        new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer,
        }),
      );
    },
    bytes,
  );
}

for (const locale of ['en', 'ar'] as const) {
  test(`${locale} PDF to Text extracts text with the current PDF.js build`, async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await page.goto(`/${locale}/tools/pdf-to-text`);
    await continuePastToolDisclosure(page);
    await dispatchFileDrop(page, COPY[locale].dropzone, await createPdfFixture());

    try {
      await expect(page.locator('pre.tool-output').first()).toContainText(COPY.en.extractedText, {
        timeout: 15_000,
      });
    } catch (error) {
      console.error({ pageErrors, consoleErrors });
      throw error;
    }
    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}

import { PDFDocument } from 'pdf-lib';
import { expect, test, type Page } from '@playwright/test';
import { continuePastToolDisclosure } from './helpers/tool-disclosure';

type Locale = 'en' | 'ar';
type PdfTestWindow = Window & { __pdfPageRemoverArrayBufferReads?: number };

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const COPY = {
  en: {
    dropzone: 'Drag & drop a PDF file or click to upload',
    totalPages: 'Total Pages',
    selectToRemove: 'Select pages to remove',
    selectAll: 'Select All',
    remove: 'Remove Selected Pages',
    download: 'Download New PDF',
    invalidFile: 'Please choose a PDF file.',
    fileTooLarge: 'File is too large. Maximum size is 25 MB.',
    cannotRemoveAll: 'Cannot remove all pages',
  },
  ar: {
    dropzone: 'اسحب وأسقط ملف PDF أو انقر للرفع',
    totalPages: 'إجمالي الصفحات',
    selectToRemove: 'حدد الصفحات للحذف',
    selectAll: 'تحديد الكل',
    remove: 'حذف الصفحات المحددة',
    download: 'تحميل PDF الجديد',
    invalidFile: 'يرجى اختيار ملف PDF.',
    fileTooLarge: 'الملف كبير جدًا. الحد الأقصى للحجم هو 25 ميجابايت.',
    cannotRemoveAll: 'لا يمكن حذف جميع الصفحات',
  },
} as const satisfies Record<Locale, Record<string, string>>;

type DropFile = {
  name: string;
  mimeType: string;
  bytes: number[];
  reportedSize?: number;
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');

    const target = window as PdfTestWindow;
    target.__pdfPageRemoverArrayBufferReads = 0;
    const originalArrayBuffer = Blob.prototype.arrayBuffer;
    Object.defineProperty(Blob.prototype, 'arrayBuffer', {
      configurable: true,
      value: function (this: Blob) {
        target.__pdfPageRemoverArrayBufferReads =
          (target.__pdfPageRemoverArrayBufferReads ?? 0) + 1;
        return originalArrayBuffer.call(this);
      },
    });
  });
});

async function dispatchFileDrop(page: Page, dropzoneLabel: string, file: DropFile) {
  await page.getByRole('button', { name: dropzoneLabel, exact: true }).evaluate(
    (element, fileSpec) => {
      const browserFile = new File(
        [new Uint8Array(fileSpec.bytes)],
        fileSpec.name,
        { type: fileSpec.mimeType },
      );
      if (fileSpec.reportedSize !== undefined) {
        Object.defineProperty(browserFile, 'size', {
          configurable: true,
          value: fileSpec.reportedSize,
        });
      }
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
    file,
  );
}

async function arrayBufferReadCount(page: Page) {
  return page.evaluate(() => (window as PdfTestWindow).__pdfPageRemoverArrayBufferReads ?? 0);
}

async function createPdfFixture(pageCount: number) {
  const pdf = await PDFDocument.create();
  for (let index = 0; index < pageCount; index += 1) {
    pdf.addPage([100, 100]);
  }
  return Array.from(await pdf.save());
}

for (const locale of ['en', 'ar'] as const) {
  const copy = COPY[locale];

  for (const key of ['Enter', 'Space'] as const) {
    test(`${locale} PDF dropzone opens its file chooser from ${key}`, async ({ page }) => {
      await page.goto(`/${locale}/tools/pdf-page-remover`);
      await continuePastToolDisclosure(page);

      const dropzone = page.getByRole('button', { name: copy.dropzone, exact: true });
      await dropzone.focus();
      await expect(dropzone).toBeFocused();

      const fileChooserPromise = page.waitForEvent('filechooser');
      await dropzone.press(key);
      const fileChooser = await fileChooserPromise;

      expect(fileChooser.isMultiple()).toBe(false);
      const input = await fileChooser.element();
      expect(await input.getAttribute('accept')).toBe('.pdf,application/pdf');
    });
  }

  for (const rejectedFile of [
    {
      name: 'notes.txt',
      mimeType: 'text/plain',
      bytes: Array.from(Buffer.from('not a pdf')),
      expectedError: copy.invalidFile,
    },
    {
      name: 'oversized.pdf',
      mimeType: 'application/pdf',
      bytes: Array.from(Buffer.from('small fixture body')),
      reportedSize: MAX_FILE_SIZE + 1,
      expectedError: copy.fileTooLarge,
    },
  ] as const) {
    test(`${locale} rejects ${rejectedFile.name} before reading it`, async ({ page }) => {
      await page.goto(`/${locale}/tools/pdf-page-remover`);
      await continuePastToolDisclosure(page);

      await dispatchFileDrop(page, copy.dropzone, rejectedFile);
      await expect(page.locator('p[role="alert"]')).toHaveText(rejectedFile.expectedError);
      expect(await arrayBufferReadCount(page)).toBe(0);
    });
  }

  test(`${locale} prevents removing every PDF page`, async ({ page }) => {
    await page.goto(`/${locale}/tools/pdf-page-remover`);
    await continuePastToolDisclosure(page);

    await dispatchFileDrop(page, copy.dropzone, {
      name: 'two-pages.pdf',
      mimeType: 'application/pdf',
      bytes: await createPdfFixture(2),
    });
    await expect(page.getByText(`${copy.totalPages}: 2`, { exact: true })).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole('button', { name: copy.selectAll, exact: true }).click();
    await expect(page.getByText(`${copy.selectToRemove} (2)`, { exact: true })).toBeVisible();
    await page.getByRole('button', { name: copy.remove, exact: true }).click();

    await expect(page.locator('p[role="alert"]')).toHaveText(copy.cannotRemoveAll);
    await expect(page.getByRole('button', { name: copy.download, exact: true })).toHaveCount(0);
    await expect(page.getByText(`${copy.totalPages}: 2`, { exact: true })).toBeVisible();
  });
}

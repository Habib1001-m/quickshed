import type { Page } from '@playwright/test';

/**
 * T012 compatibility helper: tool-specific tests must explicitly pass the
 * privacy/offline disclosure before asserting on a lazy-loaded tool UI.
 */
export async function continuePastToolDisclosure(page: Page) {
  await page.getByTestId('tool-use-disclosure').waitFor({ state: 'visible' });
  await page.getByTestId('tool-disclosure-continue').click();
  await page.getByTestId('tool-use-content').waitFor({ state: 'visible' });
}

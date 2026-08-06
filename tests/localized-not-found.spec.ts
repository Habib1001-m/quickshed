import { expect, test } from '@playwright/test';

test.describe('localized not-found boundaries', () => {
  test('includes the localized 404 copy in the server response', async ({ request }) => {
    const cases = [
      {
        path: '/ar/tools/does-not-exist',
        copy: 'هذه الصفحة غير موجودة. ربما تم نقلها أو حذفها.',
        localePath: '/ar',
      },
      {
        path: '/en/tools/does-not-exist',
        copy: "This page doesn't exist. It might have been moved or deleted.",
        localePath: '/en',
      },
    ];

    for (const item of cases) {
      const response = await request.get(item.path);
      expect(response.status()).toBe(404);
      const html = await response.text();
      expect(html).toContain(item.copy);
      expect(html).toContain(item.localePath);
    }
  });

  test('renders the Arabic 404 boundary for an unknown localized route', async ({ page }) => {
    const response = await page.goto('/ar/tools/does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByText('هذه الصفحة غير موجودة')).toBeVisible();
    await expect(page.getByRole('link', { name: 'العودة إلى QuickShed' })).toHaveAttribute('href', '/ar');
  });

  test('renders the English 404 boundary for an unknown localized route', async ({ page }) => {
    const response = await page.goto('/en/tools/does-not-exist');

    expect(response?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByText("This page doesn't exist")).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to QuickShed' })).toHaveAttribute('href', '/en');
  });
});

import { expect, test, type Page } from '@playwright/test';
import enMessages from '../messages/en.json';
import arMessages from '../messages/ar.json';

type Locale = 'en' | 'ar';
type Theme = 'light' | 'dark';

const SETTINGS_COPY: Record<Locale, {
  direction: 'ltr' | 'rtl';
  heading: string;
  language: string;
  english: string;
  arabic: string;
  theme: string;
  light: string;
  dark: string;
  statistics: string;
  tools: string;
  favorites: string;
  recent: string;
  onDevice: string;
  dataManagement: string;
  clearHistory: string;
  clearAllData: string;
  clearAllConfirm: string;
  confirmClear: string;
  cancel: string;
  guidedTour: string;
  backup: string;
  about: string;
  aboutDescription: string;
}> = {
  en: {
    direction: 'ltr',
    heading: 'Settings',
    language: 'Language',
    english: 'English',
    arabic: 'عربي',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    statistics: 'Statistics',
    tools: 'Tools',
    favorites: 'Favorites',
    recent: 'Recent',
    onDevice: 'On-device',
    dataManagement: 'Data Management',
    clearHistory: 'Clear History',
    clearAllData: 'Clear All Data',
    clearAllConfirm: 'Are you sure? All saved app and tool data will be deleted.',
    confirmClear: 'Yes, Clear',
    cancel: 'Cancel',
    guidedTour: 'Guided Tour',
    backup: 'Backup',
    about: 'About',
    aboutDescription: 'Your free privacy-first toolbox. All tools run locally in your browser.',
  },
  ar: {
    direction: 'rtl',
    heading: 'الإعدادات',
    language: 'اللغة',
    english: 'English',
    arabic: 'عربي',
    theme: 'المظهر',
    light: 'فاتح',
    dark: 'داكن',
    statistics: 'الإحصائيات',
    tools: 'أداة',
    favorites: 'مفضلة',
    recent: 'مستخدمة مؤخراً',
    onDevice: 'على الجهاز',
    dataManagement: 'إدارة البيانات',
    clearHistory: 'مسح السجل',
    clearAllData: 'مسح جميع البيانات',
    clearAllConfirm: 'هل أنت متأكد؟ سيتم حذف جميع بيانات التطبيق والأدوات المحفوظة.',
    confirmClear: 'نعم، مسح',
    cancel: 'إلغاء',
    guidedTour: 'الجولة التعريفية',
    backup: 'نسخ احتياطي',
    about: 'حول',
    aboutDescription: 'صندوق أدوات مجاني يحترم خصوصيتك. جميع الأدوات تعمل محلياً في متصفحك.',
  },
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('quickshed-welcomed', 'true');
    localStorage.setItem('quickshed-onboarding-complete', 'true');
    localStorage.setItem('quickshed-banner-dismissed', 'true');
    localStorage.removeItem('quickshed-accent-color');
  });
});

async function openSettings(page: Page, locale: Locale, theme: Theme, width: number) {
  const copy = SETTINGS_COPY[locale];
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`/${locale}`);
  await page.evaluate((selectedTheme) => {
    localStorage.setItem('theme', selectedTheme);
  }, theme);
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.locator('html')).toHaveClass(new RegExp(`(?:^|\\s)${theme}(?:\\s|$)`));
  await page.locator('header').getByRole('button', { name: copy.heading, exact: true }).click();

  const panel = page.getByTestId('settings-panel');
  await expect(panel).toBeVisible();
  return panel;
}

test('settings messages keep EN and AR key parity', () => {
  expect(Object.keys(enMessages.settings).sort()).toEqual(Object.keys(arMessages.settings).sort());
  expect(Object.values(enMessages.settings).every((message) => message.trim().length > 0)).toBe(true);
  expect(Object.values(arMessages.settings).every((message) => message.trim().length > 0)).toBe(true);
});

for (const locale of ['en', 'ar'] as const) {
  test(`${locale} centralizes Settings copy across themes and viewports`, async ({ page }) => {
    const copy = SETTINGS_COPY[locale];

    for (const theme of ['light', 'dark'] as const) {
      for (const width of [320, 1280]) {
        const panel = await openSettings(page, locale, theme, width);

        await expect(panel).toHaveAttribute('dir', copy.direction);
        await expect(panel.getByRole('heading', { name: copy.heading, exact: true })).toBeVisible();
        for (const label of [
          copy.language,
          copy.english,
          copy.arabic,
          copy.theme,
          copy.light,
          copy.dark,
          copy.statistics,
          copy.tools,
          copy.favorites,
          copy.recent,
          copy.onDevice,
          copy.dataManagement,
          copy.clearHistory,
          copy.clearAllData,
          copy.guidedTour,
          copy.backup,
          copy.about,
          copy.aboutDescription,
        ]) {
          await expect(panel.getByText(label, { exact: true })).toBeVisible();
        }

        await page.evaluate(() => {
          localStorage.setItem('quickshed-recent', JSON.stringify(['json-formatter']));
        });
        await panel.getByRole('button', { name: copy.clearHistory, exact: true }).click();
        await expect
          .poll(() => page.evaluate(() => localStorage.getItem('quickshed-recent')))
          .toBe('[]');

        await panel.getByRole('button', { name: copy.clearAllData, exact: true }).click();
        await expect(panel.getByText(copy.clearAllConfirm, { exact: true })).toBeVisible();
        await expect(panel.getByRole('button', { name: copy.confirmClear, exact: true })).toBeVisible();
        await panel.getByRole('button', { name: copy.cancel, exact: true }).click();
        await expect(panel.getByText(copy.clearAllConfirm, { exact: true })).toBeHidden();

        const layout = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        }));
        expect(layout.scrollWidth).toBe(layout.viewportWidth);
      }
    }
  });
}

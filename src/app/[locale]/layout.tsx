import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Inter } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import { Tajawal } from 'next/font/google';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { LOCALES, SITE_URL } from '@/lib/site-config';

const outfit = Outfit({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  adjustFontFallback: false,
  preload: false,
});

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  preload: false,
});

const tajawal = Tajawal({
  variable: '--font-arabic',
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  adjustFontFallback: false,
  preload: false,
});

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  const title = isArabic
    ? 'صندوق أدواتك الفوري الذي يحترم الخصوصية'
    : 'Your Instant Privacy-First Toolbox';
  const description = isArabic
    ? 'صندوق أدوات ويب مجاني يحترم الخصوصية مع أكثر من 90 أداة تعمل بالكامل في متصفحك. بدون حسابات. بدون إعلانات. بياناتك تبقى على جهازك.'
    : 'Free, privacy-respecting web toolbox with 90+ tools that run entirely in your browser. No accounts. No ads. Your data stays on your device.';
  const localeUrl = `${SITE_URL}/${locale}`;

  return {
    title,
    description,
    openGraph: {
      title: isArabic
        ? 'QuickShed - صندوق أدواتك الفوري الذي يحترم الخصوصية'
        : 'QuickShed - Your Instant Privacy-First Toolbox',
      description,
      siteName: 'QuickShed',
      type: 'website',
      url: localeUrl,
      locale: isArabic ? 'ar_SA' : 'en_US',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: isArabic
        ? 'QuickShed - صندوق أدواتك الفوري الذي يحترم الخصوصية'
        : 'QuickShed - Your Instant Privacy-First Toolbox',
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: localeUrl,
      languages: {
        en: `${SITE_URL}/en`,
        ar: `${SITE_URL}/ar`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} ${tajawal.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: 'var(--font-sans), system-ui, sans-serif' }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

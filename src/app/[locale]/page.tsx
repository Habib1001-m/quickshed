import type { Metadata } from 'next';
import { SITE_URL, LOCALES } from '@/lib/site-config';
import RoutePageShell from '@/components/RoutePageShell';

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';

  const title = isArabic
    ? 'QuickShed - صندوق أدواتك الفوري الذي يحترم الخصوصية'
    : 'QuickShed - Your Instant Privacy-First Toolbox';
  const description = isArabic
    ? 'صندوق أدوات وي مجاني يحترم الخصوصية مع أكثر من 90 أداة تعمل بالكامل في متصفحك. بدون حسابات. بدون إعلانات. بياناتك تبقى على جهازك.'
    : 'Free, privacy-respecting web toolbox with 90+ tools that run entirely in your browser. No accounts. No ads. Your data stays on your device.';
  const localeUrl = `${SITE_URL}/${locale}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'QuickShed',
      type: 'website',
      url: localeUrl,
      locale: isArabic ? 'ar_SA' : 'en_US',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
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

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params;
  return <RoutePageShell initialView="home" initialLocale={locale} />;
}

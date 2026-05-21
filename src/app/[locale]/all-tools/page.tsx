import type { Metadata } from 'next';
import { SITE_URL, LOCALES } from '@/lib/site-config';
import RoutePageShell from '@/components/RoutePageShell';

interface AllToolsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AllToolsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';
  const title = isArabic ? 'جميع الأدوات - QuickShed' : 'All Tools - QuickShed';
  const description = isArabic
    ? 'تصفح أكثر من 90 أداة مجانية تحترم الخصوصية تعمل بالكامل في متصفحك. بدون حسابات. بدون إعلانات.'
    : 'Browse all 90+ free, privacy-first tools that run entirely in your browser. No accounts. No ads.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'QuickShed',
      type: 'website',
      url: `${SITE_URL}/${locale}/all-tools`,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/all-tools`,
      languages: {
        en: `${SITE_URL}/en/all-tools`,
        ar: `${SITE_URL}/ar/all-tools`,
      },
    },
  };
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function AllToolsPage({ params }: AllToolsPageProps) {
  const { locale } = await params;
  return <RoutePageShell initialView="all-tools" initialLocale={locale} />;
}

import type { Metadata } from 'next';
import { SITE_URL, LOCALES } from '@/lib/site-config';
import RoutePageShell from '@/components/RoutePageShell';

interface CategoryListPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CategoryListPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';
  const title = isArabic ? 'جميع التصنيفات - كويك شيد' : 'All Categories - QuickShed';
  const description = isArabic
    ? 'تصفح جميع تصنيفات الأدوات: الآلات الحاسبة، أدوات النص، محولات، أدوات PDF والمزيد.'
    : 'Browse all tool categories: Calculators, Text Tools, Converters, PDF Tools, and more.';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'QuickShed',
      type: 'website',
      url: `${SITE_URL}/${locale}/category`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/category`,
      languages: { en: `${SITE_URL}/en/category`, ar: `${SITE_URL}/ar/category` },
    },
  };
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function CategoryListPage({ params }: CategoryListPageProps) {
  const { locale } = await params;
  return <RoutePageShell initialView="categories" initialLocale={locale} />;
}

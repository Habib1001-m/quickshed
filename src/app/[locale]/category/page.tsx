import type { Metadata } from 'next';
import { getCategories, localize } from '@/lib/tool-utils';
import { SITE_URL, LOCALES, type AppLocale } from '@/lib/site-config';
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
  const socialImage = { url: '/og-image.png', width: 1200, height: 630 };
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'QuickShed',
      type: 'website',
      url: `${SITE_URL}/${locale}/category`,
      images: [socialImage],
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
  const loc = (locale === 'ar' || locale === 'en' ? locale : 'en') as AppLocale;
  const isArabic = loc === 'ar';
  const categories = getCategories();
  const heading = isArabic ? 'جميع التصنيفات' : 'All Categories';
  const description = isArabic
    ? 'تصفح جميع تصنيفات الأدوات: الآلات الحاسبة، أدوات النص، محولات، أدوات PDF والمزيد.'
    : 'Browse all tool categories: Calculators, Text Tools, Converters, PDF Tools, and more.';

  return (
    <>
      {/* Server-rendered fallback for crawlers and users before SPA hydration. */}
      <div id="seo-content" className="sr-only">
        <h1>{heading}</h1>
        <p>{description}</p>
        <ul>
          {categories.map((category) => (
            <li key={category.slug}>
              <a href={`${SITE_URL}/${loc}/category/${category.slug}`}>
                {localize(category.name, loc)}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <RoutePageShell initialView="categories" initialLocale={locale} />
    </>
  );
}

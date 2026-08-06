import type { Metadata } from 'next';
import { SITE_URL, LOCALES } from '@/lib/site-config';
import RoutePageShell from '@/components/RoutePageShell';

interface FavoritesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: FavoritesPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';
  const title = isArabic ? 'المفضلة - QuickShed' : 'My Favorites - QuickShed';
  const description = isArabic
    ? 'وصول سريع لأدواتك المفضلة. مجانية، تحترم الخصوصية، تعمل بالكامل في متصفحك.'
    : 'Quick access to your favorite QuickShed tools. Free, privacy-first, runs entirely in your browser.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'QuickShed',
      type: 'website',
      url: `${SITE_URL}/${locale}/favorites`,
    },
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/favorites`,
      languages: {
        en: `${SITE_URL}/en/favorites`,
        ar: `${SITE_URL}/ar/favorites`,
      },
    },
  };
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
  const { locale } = await params;
  return <RoutePageShell initialView="favorites" initialLocale={locale} />;
}

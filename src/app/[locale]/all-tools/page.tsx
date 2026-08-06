import type { Metadata } from 'next';
import { SITE_URL, LOCALES } from '@/lib/site-config';
import { getAllTools, getCategories, localize } from '@/lib/tool-utils';
import type { Locale } from '@/lib/store';
import RoutePageShell from '@/components/RoutePageShell';

interface AllToolsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AllToolsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';
  const title = isArabic ? 'جميع الأدوات - QuickShed' : 'All Tools - QuickShed';
  const description = isArabic
    ? 'تصفح ٩٠ أداة مجانية تحترم الخصوصية تعمل بالكامل في متصفحك. بدون حسابات. بدون إعلانات.'
    : 'Browse all 90 free, privacy-first tools that run entirely in your browser. No accounts. No ads.';

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
  const loc = (locale === 'ar' || locale === 'en' ? locale : 'en') as Locale;
  const categories = getCategories();
  const allTools = getAllTools();
  const isArabic = loc === 'ar';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isArabic ? 'جميع الأدوات - QuickShed' : 'All Tools - QuickShed',
    description: isArabic
      ? 'تصفح ٩٠ أداة مجانية تحترم الخصوصية تعمل بالكامل في متصفحك.'
      : 'Browse all 90 free, privacy-first tools that run entirely in your browser.',
    url: `${SITE_URL}/${loc}/all-tools`,
  };

  return (
    <>
      <script
        id={`json-ld-all-tools-${loc}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* SEO content visible to crawlers and screen readers, removed after JS hydration */}
      <div id="seo-content" className="sr-only">
        <h1>{isArabic ? 'جميع الأدوات' : 'All Tools'}</h1>
        {categories.map((cat) => (
          <section key={cat.slug}>
            <h2>{localize(cat.name, loc)}</h2>
            <ul>
              {allTools
                .filter((t) => t.category === cat.slug)
                .map((tool) => (
                  <li key={tool.id}>
                    <a href={`${SITE_URL}/${loc}/tools/${tool.slug}`}>
                      {localize(tool.name, loc)}
                    </a>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
      <RoutePageShell initialView="all-tools" initialLocale={locale} />
    </>
  );
}

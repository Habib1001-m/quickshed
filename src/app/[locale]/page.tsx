import type { Metadata } from 'next';
import { SITE_URL, LOCALES } from '@/lib/site-config';
import { getCategories, getAllTools, localize } from '@/lib/tool-utils';
import type { Locale } from '@/lib/store';
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
    ? 'صندوق أدوات ويب مجاني يحترم الخصوصية مع أكثر من 90 أداة تعمل بالكامل في متصفحك. بدون حسابات. بدون إعلانات. بياناتك تبقى على جهازك.'
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
  const loc = (locale === 'ar' || locale === 'en' ? locale : 'en') as Locale;
  const categories = getCategories();
  const allTools = getAllTools();

  const isArabic = loc === 'ar';
  const heroTitle = isArabic
    ? 'صندوق أدواتك الفوري والآمن'
    : 'Your Instant Privacy-First Toolbox';
  const heroSubtitle = isArabic
    ? 'أكثر من ٩٠ أداة مجانية تعمل بالكامل في متصفحك. بدون حسابات. بدون إعلانات. بياناتك تبقى على جهازك.'
    : '90+ free tools that run entirely in your browser. No accounts. No ads. Your data stays on your device.';
  const featuredLabel = isArabic ? 'الأدوات المميزة' : 'Featured Tools';
  const categoriesLabel = isArabic ? 'جميع التصنيفات' : 'All Categories';
  const toolsLabel = isArabic ? 'أداة' : 'tools';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'QuickShed',
    alternateName: isArabic ? 'كويك شيد' : 'QuickShed',
    url: `${SITE_URL}/${loc}`,
    description: isArabic
      ? 'صندوق أدوات ويب مجاني يحترم خصوصيتك مع أكثر من ٩٠ أداة تعمل بالكامل في متصفحك.'
      : 'Free, privacy-respecting web toolbox with 90+ tools that run entirely in your browser.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/${loc}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* SEO content visible to crawlers, hidden after JS hydration */}
      <div
        id="seo-content"
        style={{ position: 'absolute', left: '-9999px', top: 0, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <h1>{heroTitle}</h1>
        <p>{heroSubtitle}</p>
        <h2>{categoriesLabel}</h2>
        <ul>
          {categories.map((cat) => (
            <li key={cat.slug}>
              <a href={`${SITE_URL}/${loc}/category/${cat.slug}`}>
                {localize(cat.name, loc)} — {cat.toolCount} {toolsLabel}
              </a>
            </li>
          ))}
        </ul>
        <h2>{featuredLabel}</h2>
        <ul>
          {allTools.slice(0, 20).map((tool) => (
            <li key={tool.id}>
              <a href={`${SITE_URL}/${loc}/tools/${tool.slug}`}>
                {localize(tool.name, loc)}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <RoutePageShell initialView="home" initialLocale={locale} />
    </>
  );
}

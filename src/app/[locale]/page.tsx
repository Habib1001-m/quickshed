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
    ? 'صندوق أدواتك الفوري الذي يحترم الخصوصية'
    : 'Your Instant Privacy-First Toolbox';
  const description = isArabic
    ? 'صندوق أدوات ويب مجاني يحترم الخصوصية يضم ٩٠ أداة. توضّح كل أداة كيفية تعاملها مع البيانات. بدون حسابات. بدون إعلانات.'
    : 'Free, privacy-respecting web toolbox with 90 tools. Each tool shows how it handles data. No accounts. No ads.';
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
    ? 'صندوق أدواتك الفوري الذي يحترم الخصوصية'
    : 'Your Instant Privacy-First Toolbox';
  const heroSubtitle = isArabic
    ? '٩٠ أداة مجانية للمهام اليومية. توضّح كل أداة فئة تعاملها مع البيانات. بدون حسابات. بدون إعلانات.'
    : '90 free tools for everyday tasks. Each tool shows its data-handling category. No accounts. No ads.';
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
      ? 'صندوق أدوات ويب مجاني يحترم خصوصيتك يضم ٩٠ أداة، وتوضح كل أداة كيفية تعاملها مع البيانات.'
      : 'Free, privacy-respecting web toolbox with 90 browser-based tools. Each tool shows how it handles data.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/${loc}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        id={`json-ld-website-${loc}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* SEO content visible to crawlers and screen readers, removed after JS hydration */}
      <div id="seo-content" className="sr-only">
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

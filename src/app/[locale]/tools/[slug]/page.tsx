import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllTools, getToolById, localize } from '@/lib/tool-utils';
import type { Privacy } from '@/lib/tool-schema';
import { SITE_URL, LOCALES, type AppLocale } from '@/lib/site-config';
import RoutePageShell from '@/components/RoutePageShell';

interface ToolPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/**
 * Exhaustive four-level SEO/privacy disclosure. Every
 * Privacy value gets its own accurate copy; `file-only` and `storage` are
 * NOT described as an external API. The switch is exhaustive over the
 * shared {@link Privacy} union, so a future value fails typecheck.
 */
function seoPrivacyText(privacy: Privacy, isArabic: boolean): string {
  switch (privacy) {
    case 'local':
      return isArabic
        ? 'محلي — بياناتك تبقى على جهازك'
        : 'Local — your data stays on your device';
    case 'file-only':
      return isArabic
        ? 'ملف فقط — تتم المعالجة داخل الملف الذي تحمّله'
        : 'File-only — processed inside the file you load';
    case 'storage':
      return isArabic
        ? 'على الجهاز — يُحفظ في متصفحك'
        : 'On-device — saved in your browser';
    case 'api':
      return isArabic
        ? 'يستخدم خدمة خارجية آمنة'
        : 'Uses a secure external service';
  }
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const tool = getToolById(slug);
  if (!tool) return { title: 'Tool Not Found' };

  const loc = (locale === 'ar' || locale === 'en' ? locale : 'en') as AppLocale;
  const title = `${localize(tool.name, loc)} - QuickShed`;
  const description = localize(tool.description, loc);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'QuickShed',
      type: 'website',
      url: `${SITE_URL}/${locale}/tools/${tool.slug}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/tools/${tool.slug}`,
      languages: {
        en: `${SITE_URL}/en/tools/${tool.slug}`,
        ar: `${SITE_URL}/ar/tools/${tool.slug}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const tools = getAllTools();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    for (const tool of tools) {
      params.push({ locale, slug: tool.slug });
    }
  }
  return params;
}

export default async function ToolPage({ params }: ToolPageProps) {
  const { locale, slug } = await params;
  const tool = getToolById(slug);
  if (!tool) notFound();

  const loc = (locale === 'ar' || locale === 'en' ? locale : 'en') as AppLocale;
  const isArabic = loc === 'ar';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: localize(tool.name, loc),
    description: localize(tool.description, loc),
    applicationCategory: 'UtilityApplication',
    operatingSystem: 'All',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };

  return (
    <>
      <script
        id={`json-ld-tool-${tool.slug}-${loc}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* SEO content visible to crawlers and screen readers, removed after JS hydration */}
      <div id="seo-content" className="sr-only">
        <h1>{localize(tool.name, loc)}</h1>
        <p>{localize(tool.description, loc)}</p>
        <p>
          {isArabic ? 'الفئة' : 'Category'}:{' '}
          <a href={`${SITE_URL}/${loc}/category/${tool.category}`}>{tool.category}</a>
        </p>
        <p>
          {isArabic ? 'الخصوصية' : 'Privacy'}: {seoPrivacyText(tool.privacy, isArabic)}
        </p>
      </div>
      <RoutePageShell initialView="tool" initialToolId={tool.id} initialLocale={locale} />
    </>
  );
}

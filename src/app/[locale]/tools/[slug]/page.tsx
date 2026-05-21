import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllTools, getToolById, localize } from '@/lib/tool-utils';
import { SITE_URL, LOCALES, type AppLocale } from '@/lib/site-config';
import RoutePageShell from '@/components/RoutePageShell';

interface ToolPageProps {
  params: Promise<{ locale: string; slug: string }>;
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
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
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
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <RoutePageShell initialView="tool" initialToolId={tool.id} initialLocale={locale} />
    </>
  );
}

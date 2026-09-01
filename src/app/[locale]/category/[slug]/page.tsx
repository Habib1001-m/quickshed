import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getCategories, getCategoryBySlug, getToolsByCategory, localize } from '@/lib/tool-utils';
import { SITE_URL, LOCALES, type AppLocale } from '@/lib/site-config';
import RoutePageShell from '@/components/RoutePageShell';

interface CategoryPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };

  const loc = (locale === 'ar' || locale === 'en' ? locale : 'en') as AppLocale;
  const catName = localize(category.name, loc);
  const title = `${catName} - QuickShed`;
  const description =
    loc === 'ar'
      ? `تصفح أكثر من ${category.toolCount} أداة ${catName}. مجانية، تحترم الخصوصية، تعمل بالكامل في متصفحك.`
      : `Browse ${category.toolCount}+ ${catName.toLowerCase()} tools. Free, privacy-first, runs entirely in your browser.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'QuickShed',
      type: 'website',
      url: `${SITE_URL}/${locale}/category/${category.slug}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/category/${category.slug}`,
      languages: {
        en: `${SITE_URL}/en/category/${category.slug}`,
        ar: `${SITE_URL}/ar/category/${category.slug}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const categories = getCategories();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    for (const cat of categories) {
      params.push({ locale, slug: cat.slug });
    }
  }
  return params;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const loc = (locale === 'ar' || locale === 'en' ? locale : 'en') as AppLocale;
  const catName = localize(category.name, loc);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: catName,
    description:
      loc === 'ar'
        ? `تصفح أكثر من ${category.toolCount} أداة ${catName}. مجانية، تحترم الخصوصية، تعمل بالكامل في متصفحك.`
        : `Browse ${category.toolCount}+ ${catName.toLowerCase()} tools. Free, privacy-first, runs entirely in your browser.`,
    url: `${SITE_URL}/${locale}/category/${category.slug}`,
    isPartOf: { '@type': 'WebSite', name: 'QuickShed', url: SITE_URL },
  };

  return (
    <>
      <script
        id={`json-ld-category-${category.slug}-${loc}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* SEO content visible to crawlers and screen readers, removed after JS hydration */}
      <div id="seo-content" className="sr-only">
        <h1>{catName}</h1>
        <ul>
          {getToolsByCategory(category.slug).map((tool) => (
            <li key={tool.id}>
              <a href={`${SITE_URL}/${loc}/tools/${tool.slug}`}>
                {localize(tool.name, loc)}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <RoutePageShell initialView="category" initialCategorySlug={slug} initialLocale={locale} />
    </>
  );
}

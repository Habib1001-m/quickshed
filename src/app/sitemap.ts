import type { MetadataRoute } from 'next';
import { getAllTools, getCategories } from '@/lib/tool-utils';
import { SITE_URL, LOCALES } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = getAllTools();
  const categories = getCategories();

  const homePages: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: locale === 'en' ? 1.0 : 0.9,
    alternates: { languages: { en: `${SITE_URL}/en`, ar: `${SITE_URL}/ar` } },
  }));

  const allToolsPages: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}/all-tools`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
    alternates: { languages: { en: `${SITE_URL}/en/all-tools`, ar: `${SITE_URL}/ar/all-tools` } },
  }));

  const staticPages: MetadataRoute.Sitemap = ['privacy', 'terms'].flatMap((page) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/${page}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: { languages: { en: `${SITE_URL}/en/${page}`, ar: `${SITE_URL}/ar/${page}` } },
    }))
  );

  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/category/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: { languages: { en: `${SITE_URL}/en/category/${cat.slug}`, ar: `${SITE_URL}/ar/category/${cat.slug}` } },
    }))
  );

  const toolPages: MetadataRoute.Sitemap = tools.flatMap((tool) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/tools/${tool.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: { languages: { en: `${SITE_URL}/en/tools/${tool.slug}`, ar: `${SITE_URL}/ar/tools/${tool.slug}` } },
    }))
  );

  return [...homePages, ...allToolsPages, ...staticPages, ...categoryPages, ...toolPages];
}

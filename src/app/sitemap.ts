import type { MetadataRoute } from 'next';
import { getAllTools, getCategories } from '@/lib/tool-utils';
import { getAllPosts } from '@/lib/blog';
import { SITE_URL, LOCALES } from '@/lib/site-config';

function localizedAlternates(path: string) {
  return {
    languages: {
      en: `${SITE_URL}/en${path}`,
      ar: `${SITE_URL}/ar${path}`,
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = getAllTools();
  const categories = getCategories();

  const homePages: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    changeFrequency: 'daily' as const,
    priority: locale === 'en' ? 1.0 : 0.9,
    alternates: localizedAlternates(''),
  }));

  const allToolsPages: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}/all-tools`,
    changeFrequency: 'daily' as const,
    priority: 0.9,
    alternates: localizedAlternates('/all-tools'),
  }));

  const staticPages: MetadataRoute.Sitemap = ['privacy', 'terms'].flatMap((page) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/${page}`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: localizedAlternates(`/${page}`),
    }))
  );

  const categoryIndexPages: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}/category`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: localizedAlternates('/category'),
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.flatMap((cat) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/category/${cat.slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: localizedAlternates(`/category/${cat.slug}`),
    }))
  );

  const toolPages: MetadataRoute.Sitemap = tools.flatMap((tool) =>
    LOCALES.map((locale) => ({
      url: `${SITE_URL}/${locale}/tools/${tool.slug}`,
      ...(tool.updatedAt ? { lastModified: tool.updatedAt } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: localizedAlternates(`/tools/${tool.slug}`),
    }))
  );

  const blogIndexPages: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}/blog`,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    alternates: localizedAlternates('/blog'),
  }));

  const blogPostPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    getAllPosts(locale).map((post) => ({
      url: `${SITE_URL}/${locale}/blog/${post.slug}`,
      ...(post.date ? { lastModified: post.date } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: localizedAlternates(`/blog/${post.slug}`),
    }))
  );

  return [
    ...homePages,
    ...allToolsPages,
    ...staticPages,
    ...categoryIndexPages,
    ...categoryPages,
    ...toolPages,
    ...blogIndexPages,
    ...blogPostPages,
  ];
}

const BLOG_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BLOG_LOCALES = new Set(['en', 'ar']);

export function isSafeBlogLocale(locale: string): boolean {
  return BLOG_LOCALES.has(locale);
}

export function isSafeBlogSlug(slug: string): boolean {
  return BLOG_SLUG_PATTERN.test(slug);
}

export function getBlogPostHref(locale: string, slug: string): string | null {
  if (!isSafeBlogLocale(locale) || !isSafeBlogSlug(slug)) return null;

  return `/${encodeURIComponent(locale)}/blog/${encodeURIComponent(slug)}`;
}

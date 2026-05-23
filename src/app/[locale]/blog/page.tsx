import { getAllPosts } from '@/lib/blog';
import { LOCALES, SITE_URL } from '@/lib/site-config';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock, Tag } from 'lucide-react';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';
  const title = isArabic ? 'مدونة QuickShed التقنية' : 'QuickShed Tech Blog';
  const description = isArabic
    ? 'مقالات حصرية وأدلة تقنية لحل المشاكل اليومية بسرعة ومعالجة محلية 100%.'
    : 'Exclusive insights and technical guides to solve everyday tasks locally.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'QuickShed',
      type: 'website',
      url: `${SITE_URL}/${locale}/blog`,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog`,
      languages: {
        en: `${SITE_URL}/en/blog`,
        ar: `${SITE_URL}/ar/blog`,
      },
    },
  };
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function BlogListPage({ params }: Props) {
  const { locale } = await params;
  const posts = getAllPosts(locale);
  const isRtl = locale === 'ar';

  const translations = {
    ar: {
      title: 'مدونة QuickShed التقنية',
      subtitle: 'مقالات حصرية وأدلة تقنية لحل المشاكل اليومية بسرعة ومعالجة محلية 100%.',
      noPosts: 'لا توجد مقالات منشورة حالياً.',
      readMore: 'اقرأ المزيد',
    },
    en: {
      title: 'QuickShed Tech Blog',
      subtitle: 'Exclusive insights and technical guides to solve everyday tasks locally.',
      noPosts: 'No articles published yet.',
      readMore: 'Read More',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <div className="container max-w-5xl mx-auto py-12 px-4">
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">
          {t.title}
        </h1>
        <p className="text-muted-foreground text-lg">
          {t.subtitle}
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="text-center text-muted-foreground py-12">
          {t.noPosts}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group border border-border/60 rounded-xl p-6 bg-card hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <Tag className="h-3 w-3" />
                  {post.category}
                </span>
                <Link href={`/${locale}/blog/${post.slug}`}>
                  <h2 className="text-xl font-bold mt-4 mb-2 group-hover:text-emerald-500 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-muted-foreground text-sm line-clamp-3 mb-4 leading-relaxed">
                  {post.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/40 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {post.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readingTime}
                </span>
              </div>

              <Link
                href={`/${locale}/blog/${post.slug}`}
                className={`inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                {t.readMore}
                <ArrowRight className={`h-4 w-4 ${isRtl ? 'rotate-180' : ''}`} />
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

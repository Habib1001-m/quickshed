import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from 'lucide-react';
import { LOCALES, SITE_URL } from '@/lib/site-config';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);

  if (!post) {
    return { title: 'Not Found' };
  }

  const isArabic = locale === 'ar';
  const title = `${post.title} — QuickShed Blog`;
  const description = post.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'QuickShed',
      type: 'article',
      url: `${SITE_URL}/${locale}/blog/${slug}`,
      publishedTime: post.date,
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog/${slug}`,
    },
  };
}

export async function generateStaticParams() {
  const paths: { locale: string; slug: string }[] = [];

  LOCALES.forEach((locale) => {
    const posts = getAllPosts(locale);
    posts.forEach((post) => {
      paths.push({ locale, slug: post.slug });
    });
  });

  return paths;
}

// MDX components for styling
const mdxComponents = {
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-extrabold mt-8 mb-4 border-b pb-2 text-foreground" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-bold mt-6 mb-3 text-foreground" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-muted-foreground mb-4 text-base leading-7" {...props} />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 space-y-1 text-muted-foreground" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 space-y-1 text-muted-foreground" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-muted-foreground" {...props} />
  ),
  a: (props: React.HTMLAttributes<HTMLAnchorElement>) => (
    <a className="text-emerald-500 hover:text-emerald-400 hover:underline" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-sm text-emerald-500" {...props} />
  ),
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm border border-border" {...props} />
  ),
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-emerald-500 pl-4 my-4 italic text-muted-foreground" {...props} />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line jsx-a11y/alt-text
    <img className="rounded-lg max-w-full my-4 border border-border/50" {...props} />
  ),
  hr: () => <hr className="my-8 border-border/60" />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
};

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug, locale);

  if (!post) notFound();

  const isRtl = locale === 'ar';

  const translations = {
    ar: {
      backToBlog: 'العودة للمدونة',
      relatedPosts: 'مقالات ذات صلة',
    },
    en: {
      backToBlog: 'Back to Blog',
      relatedPosts: 'Related Posts',
    },
  };

  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <article className="container max-w-3xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Link
          href={`/${locale}/blog`}
          className={`inline-flex items-center gap-2 text-sm text-emerald-500 hover:underline mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}
        >
          {isRtl ? (
            <>
              <ArrowRight className="h-4 w-4" /> {t.backToBlog}
            </>
          ) : (
            <>
              <ArrowLeft className="h-4 w-4" /> {t.backToBlog}
            </>
          )}
        </Link>

        <div className={`flex items-center gap-2 text-xs font-medium text-emerald-500 mb-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
          <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase">
            <Tag className="h-3 w-3" />
            {post.category}
          </span>
          <span className="text-muted-foreground">&bull;</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {post.date}
          </span>
          <span className="text-muted-foreground">&bull;</span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            {post.readingTime}
          </span>
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
          {post.title}
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed italic">
          {post.description}
        </p>
      </div>

      <hr className="my-8 border-border/60" />

      {/* MDX Content */}
      <div className="max-w-none">
        <MDXRemote source={post.content} components={mdxComponents} />
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className={`mt-8 pt-6 border-t border-border/60 flex flex-wrap gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

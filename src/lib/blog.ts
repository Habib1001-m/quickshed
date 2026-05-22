import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  locale: string;
  title: string;
  description: string;
  date: string;
  category: string;
  tags: string[];
  readingTime: string;
  image?: string;
  content: string;
}

// 1. قراءة مقال واحد بناءً على الرابط واللغة
export function getPostBySlug(slug: string, locale: string): BlogPost | null {
  try {
    const filePath = path.join(BLOG_DIR, locale, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      slug,
      locale,
      title: data.title,
      description: data.description,
      date: data.date,
      category: data.category,
      tags: data.tags || [],
      readingTime: data.readingTime || '5 min',
      image: data.image,
      content,
    };
  } catch (error) {
    console.error(`Error reading mdx file: ${slug}`, error);
    return null;
  }
}

// 2. جلب جميع المقالات الخاصة بلغة معينة مرتبة من الأحدث للأقدم
export function getAllPosts(locale: string): BlogPost[] {
  const localeDir = path.join(BLOG_DIR, locale);
  if (!fs.existsSync(localeDir)) return [];

  const files = fs.readdirSync(localeDir);

  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const slug = file.replace('.mdx', '');
      return getPostBySlug(slug, locale);
    })
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 3. جلب المقالات المتعلقة (نفس الفئة)
export function getRelatedPosts(currentSlug: string, locale: string, category: string, limit: number = 3): BlogPost[] {
  const allPosts = getAllPosts(locale);
  return allPosts
    .filter((post) => post.slug !== currentSlug && post.category === category)
    .slice(0, limit);
}

// 4. جلب جميع التصنيفات
export function getAllCategories(locale: string): string[] {
  const posts = getAllPosts(locale);
  const categories = new Set(posts.map((post) => post.category));
  return Array.from(categories);
}

// 5. جلب المقالات حسب التصنيف
export function getPostsByCategory(locale: string, category: string): BlogPost[] {
  const allPosts = getAllPosts(locale);
  return allPosts.filter((post) => post.category === category);
}
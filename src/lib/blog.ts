import 'server-only';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { isSafeBlogLocale, isSafeBlogSlug } from './blog-slug';

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


// 1. Read single post by slug and locale
export function getPostBySlug(slug: string, locale: string): BlogPost | null {
  if (!isSafeBlogLocale(locale) || !isSafeBlogSlug(slug)) return null;

  try {
    const filePath = path.join(BLOG_DIR, locale, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) return null;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);

    return {
      slug,
      locale,
      title: String(data.title || ''),
      description: String(data.description || ''),
      // gray-matter parses YAML dates as Date objects — always convert to string
      date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : String(data.date || ''),
      category: String(data.category || ''),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      readingTime: String(data.readingTime || '5 min'),
      image: data.image ? String(data.image) : undefined,
      content,
    };
  } catch (error) {
    console.error(`Error reading mdx file: ${slug}`, error);
    return null;
  }
}

// 2. Get all posts for a locale, sorted newest first
export function getAllPosts(locale: string): BlogPost[] {
  if (!isSafeBlogLocale(locale)) return [];

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

// 3. Get related posts (same category)
export function getRelatedPosts(currentSlug: string, locale: string, category: string, limit: number = 3): BlogPost[] {
  const allPosts = getAllPosts(locale);
  return allPosts
    .filter((post) => post.slug !== currentSlug && post.category === category)
    .slice(0, limit);
}

// 4. Get all categories
export function getAllCategories(locale: string): string[] {
  const posts = getAllPosts(locale);
  const categories = new Set(posts.map((post) => post.category));
  return Array.from(categories);
}

// 5. Get posts by category
export function getPostsByCategory(locale: string, category: string): BlogPost[] {
  const allPosts = getAllPosts(locale);
  return allPosts.filter((post) => post.category === category);
}
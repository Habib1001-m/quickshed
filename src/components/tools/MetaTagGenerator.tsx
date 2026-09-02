'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Code, Eye, Globe, Twitter, Facebook } from 'lucide-react';

const labels = {
  en: {
    title: 'Meta Tag Generator',
    titleInput: 'Page Title',
    descInput: 'Page Description',
    keywordsInput: 'Keywords (comma separated)',
    authorInput: 'Author',
    urlInput: 'Page URL',
    imageInput: 'Image URL (for OG/Twitter)',
    generate: 'Generate Meta Tags',
    generatedCode: 'Generated HTML Code',
    preview: 'Preview',
    googlePreview: 'Google Search Preview',
    twitterPreview: 'Twitter Card Preview',
    facebookPreview: 'Facebook Share Preview',
    copyCode: 'Copy Code',
    copied: 'Copied!',
    titleChars: 'chars',
    titleWarn: 'Title should be under 60 characters for optimal display',
    descWarn: 'Description should be under 160 characters for optimal display',
    noPreview: 'Enter title and description to see preview',
    imagePrivacy: 'Remote image preview is disabled to keep this tool local.',
    yourUrl: 'example.com',
    image: 'Image',
  },
  ar: {
    title: 'مولّد الوسوم الوصفية',
    titleInput: 'عنوان الصفحة',
    descInput: 'وصف الصفحة',
    keywordsInput: 'الكلمات المفتاحية (مفصولة بفاصلة)',
    authorInput: 'المؤلف',
    urlInput: 'رابط الصفحة',
    imageInput: 'رابط الصورة (لـ OG/Twitter)',
    generate: 'إنشاء الوسوم الوصفية',
    generatedCode: 'كود HTML المُنشأ',
    preview: 'معاينة',
    googlePreview: 'معاينة بحث جوجل',
    twitterPreview: 'معاينة بطاقة تويتر',
    facebookPreview: 'معاينة مشاركة فيسبوك',
    copyCode: 'نسخ الكود',
    copied: 'تم النسخ!',
    titleChars: 'حرف',
    titleWarn: 'يجب أن يكون العنوان أقل من 60 حرفاً للعرض الأمثل',
    descWarn: 'يجب أن يكون الوصف أقل من 160 حرفاً للعرض الأمثل',
    noPreview: 'أدخل العنوان والوصف لرؤية المعاينة',
    imagePrivacy: 'تم تعطيل معاينة الصور الخارجية للحفاظ على عمل الأداة محليًا.',
    yourUrl: 'example.com',
    image: 'الصورة',
  },
};

export default function MetaTagGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generatedCode = useMemo(() => {
    const lines: string[] = ['<meta charset="UTF-8">', '<meta name="viewport" content="width=device-width, initial-scale=1.0">'];
    if (title) lines.push(`<title>${title}</title>`, `<meta name="title" content="${title}">`);
    if (description) lines.push(`<meta name="description" content="${description}">`);
    if (keywords) lines.push(`<meta name="keywords" content="${keywords}">`);
    if (author) lines.push(`<meta name="author" content="${author}">`);
    lines.push('');
    // Open Graph
    lines.push('<!-- Open Graph / Facebook -->');
    lines.push('<meta property="og:type" content="website">');
    if (url) lines.push(`<meta property="og:url" content="${url}">`);
    if (title) lines.push(`<meta property="og:title" content="${title}">`);
    if (description) lines.push(`<meta property="og:description" content="${description}">`);
    if (imageUrl) lines.push(`<meta property="og:image" content="${imageUrl}">`);
    lines.push('');
    // Twitter
    lines.push('<!-- Twitter -->');
    lines.push('<meta property="twitter:card" content="summary_large_image">');
    if (url) lines.push(`<meta property="twitter:url" content="${url}">`);
    if (title) lines.push(`<meta property="twitter:title" content="${title}">`);
    if (description) lines.push(`<meta property="twitter:description" content="${description}">`);
    if (imageUrl) lines.push(`<meta property="twitter:image" content="${imageUrl}">`);
    return lines.join('\n');
  }, [title, description, keywords, author, url, imageUrl]);

  const displayUrl = url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : t.yourUrl;

  const titleColor = title.length > 60 ? 'text-red-500' : title.length > 50 ? 'text-amber-500' : 'text-emerald-500';
  const descColor = description.length > 160 ? 'text-red-500' : description.length > 140 ? 'text-amber-500' : 'text-emerald-500';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No false positive success.
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Code className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t.titleInput}</Label>
              <span className={`text-xs font-medium ${titleColor}`}>{title.length}/60 {t.titleChars}</span>
            </div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titleInput} className="tool-input" />
            {title.length > 60 && <p className="text-xs text-red-500">{t.titleWarn}</p>}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t.descInput}</Label>
              <span className={`text-xs font-medium ${descColor}`}>{description.length}/160 {t.titleChars}</span>
            </div>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.descInput} className="tool-input" />
            {description.length > 160 && <p className="text-xs text-red-500">{t.descWarn}</p>}
          </div>
          <div className="space-y-2">
            <Label>{t.keywordsInput}</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder={t.keywordsInput} className="tool-input" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t.authorInput}</Label>
              <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder={t.authorInput} className="tool-input" />
            </div>
            <div className="space-y-2">
              <Label>{t.urlInput}</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="tool-input" />
            </div>
            <div className="space-y-2">
              <Label>{t.imageInput}</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="tool-input" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="code">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="code" className="flex items-center gap-2"><Code className="size-4" />{t.generatedCode}</TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2"><Eye className="size-4" />{t.preview}</TabsTrigger>
        </TabsList>
        <TabsContent value="code">
          <Card className="tool-wrapper-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="tool-section-title text-base">{t.generatedCode}</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? <span className="copy-feedback">{t.copied}</span> : t.copyCode}
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="tool-output rounded-lg bg-muted p-4 text-xs overflow-x-auto whitespace-pre-wrap">{generatedCode}</pre>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="preview" className="space-y-4">
          {/* Google Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Globe className="size-4" />{t.googlePreview}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-white dark:bg-gray-950 p-4 max-w-xl">
                <div className="text-sm text-green-700 dark:text-green-400 truncate">{displayUrl}</div>
                <div className="text-lg text-blue-700 dark:text-blue-400 hover:underline cursor-pointer line-clamp-1">{title || 'Page Title'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{description || 'Page description will appear here...'}</div>
              </div>
            </CardContent>
          </Card>
          {/* Twitter Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Twitter className="size-4" />{t.twitterPreview}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden max-w-xl bg-white dark:bg-gray-950">
                {imageUrl ? (
                  <div className="aspect-[2/1] bg-muted flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <span className="text-xs text-muted-foreground">{t.imagePrivacy}</span>
                    <span className="max-w-full break-all text-xs text-foreground/70">{imageUrl}</span>
                  </div>
                ) : (
                  <div className="aspect-[2/1] bg-muted flex items-center justify-center text-muted-foreground text-sm">{t.image}</div>
                )}
                <div className="p-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{displayUrl}</div>
                  <div className="font-bold text-sm line-clamp-1">{title || 'Page Title'}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{description || 'Page description...'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Facebook Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Facebook className="size-4" />{t.facebookPreview}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden max-w-xl bg-white dark:bg-gray-950">
                {imageUrl ? (
                  <div className="aspect-[1.91/1] bg-muted flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <span className="text-xs text-muted-foreground">{t.imagePrivacy}</span>
                    <span className="max-w-full break-all text-xs text-foreground/70">{imageUrl}</span>
                  </div>
                ) : (
                  <div className="aspect-[1.91/1] bg-muted flex items-center justify-center text-muted-foreground text-sm">{t.image}</div>
                )}
                <div className="p-3 border-t bg-gray-50 dark:bg-gray-900">
                  <div className="text-xs text-gray-500 uppercase truncate">{displayUrl}</div>
                  <div className="font-semibold text-sm line-clamp-2">{title || 'Page Title'}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{description || 'Page description...'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

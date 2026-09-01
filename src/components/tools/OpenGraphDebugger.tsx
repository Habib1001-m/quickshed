'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bug, AlertTriangle, CheckCircle } from 'lucide-react';

interface OGTag {
  property: string;
  content: string;
}

const labels = {
  en: {
    title: 'Open Graph Debugger',
    placeholder: 'Paste HTML meta tags here, e.g.:\n<meta property="og:title" content="My Page">\n<meta property="og:description" content="My Description">\n<meta property="og:image" content="https://example.com/img.jpg">',
    parse: 'Parse Tags',
    parsedTags: 'Parsed Open Graph Tags',
    preview: 'Preview Card',
    validation: 'Validation',
    missing: 'Missing required tags',
    allGood: 'All required OG tags are present',
    required: 'Required',
    optional: 'Optional',
    tag: 'Tag',
    value: 'Value',
    property: 'Property',
    content: 'Content',
    noTags: 'No OG tags found. Paste HTML containing og: meta tags.',
    imagePrivacy: 'Image preview is disabled to keep processing local.',
  },
  ar: {
    title: 'مصحح Open Graph',
    placeholder: 'الصق وصفيات HTML هنا، مثلاً:\n<meta property="og:title" content="صفحتي">\n<meta property="og:description" content="وصف صفحتي">\n<meta property="og:image" content="https://example.com/img.jpg">',
    parse: 'تحليل الوصفيات',
    parsedTags: 'وصفيات Open Graph المحللة',
    preview: 'بطاقة المعاينة',
    validation: 'التحقق',
    missing: 'وصفيات مطلوبة مفقودة',
    allGood: 'جميع وصفيات OG المطلوبة موجودة',
    required: 'مطلوب',
    optional: 'اختياري',
    tag: 'الوصف',
    value: 'القيمة',
    property: 'الخاصية',
    content: 'المحتوى',
    noTags: 'لم يتم العثور على وصفيات OG. الصق HTML يحتوي على og: meta tags.',
    imagePrivacy: 'تم تعطيل معاينة الصورة للحفاظ على المعالجة محليًا.',
  },
};

const REQUIRED_OG = ['og:title', 'og:description', 'og:image', 'og:url'];

export default function OpenGraphDebugger({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<OGTag[]>([]);

  const parseTags = () => {
    const regex = /<meta\s+(?:property|name)=["']([^"']+)["']\s+content=["']([^"']*?)["']/gi;
    const tags: OGTag[] = [];
    let match;
    while ((match = regex.exec(input)) !== null) {
      const prop = match[1];
      if (prop.startsWith('og:') || prop.startsWith('twitter:')) {
        tags.push({ property: prop, content: match[2] });
      }
    }
    setParsed(tags);
  };

  const tagMap = useMemo(() => {
    const map = new Map<string, string>();
    parsed.forEach((tag) => map.set(tag.property, tag.content));
    return map;
  }, [parsed]);

  const missingRequired = REQUIRED_OG.filter((tag) => !tagMap.has(tag) || !tagMap.get(tag));

  const title = tagMap.get('og:title') || '';
  const description = tagMap.get('og:description') || '';
  const image = tagMap.get('og:image') || '';
  const url = tagMap.get('og:url') || '';
  const displayUrl = url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'example.com';

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Bug className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="tool-input min-h-[150px] resize-y font-mono text-sm"
          />
          <Button onClick={parseTags} className="tool-action-btn">{t.parse}</Button>
        </CardContent>
      </Card>

      {parsed.length > 0 && (
        <>
          {/* Parsed Tags Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.parsedTags}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-start py-2 px-3 text-muted-foreground font-medium">{t.property}</th>
                      <th className="text-start py-2 px-3 text-muted-foreground font-medium">{t.content}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.map((tag, i) => {
                      const isRequired = REQUIRED_OG.includes(tag.property);
                      return (
                        <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="py-2 px-3 font-mono text-xs">
                            {tag.property}
                            <Badge variant={isRequired ? 'default' : 'secondary'} className="ml-2 text-[10px]">
                              {isRequired ? t.required : t.optional}
                            </Badge>
                          </td>
                          <td className="py-2 px-3 text-xs break-all">{tag.content || <span className="text-red-500 italic">empty</span>}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Validation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">{t.validation}</CardTitle>
            </CardHeader>
            <CardContent>
              {missingRequired.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle className="size-5" />
                  <span>{t.allGood}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="size-5" />
                    <span>{t.missing}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {missingRequired.map((tag) => (
                      <Badge key={tag} variant="destructive" className="text-xs">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t.preview}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden max-w-xl bg-white dark:bg-gray-950">
                {image ? (
                  <div className="aspect-[1.91/1] bg-muted flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <span className="text-xs text-muted-foreground">{t.imagePrivacy}</span>
                    <span className="max-w-full break-all text-xs text-foreground/70">{image}</span>
                  </div>
                ) : (
                  <div className="aspect-[1.91/1] bg-muted flex items-center justify-center text-muted-foreground text-sm">No Image</div>
                )}
                <div className="p-3 border-t bg-gray-50 dark:bg-gray-900">
                  <div className="text-xs text-gray-500 uppercase truncate">{displayUrl}</div>
                  <div className="font-semibold text-sm line-clamp-2">{title || 'No Title'}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{description || 'No Description'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {parsed.length === 0 && input && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">{t.noTags}</CardContent>
        </Card>
      )}
    </div>
  );
}

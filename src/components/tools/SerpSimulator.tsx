'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Smartphone } from 'lucide-react';

const labels = {
  en: {
    title: 'SERP Simulator',
    titleInput: 'Page Title',
    urlInput: 'Page URL',
    descInput: 'Meta Description',
    desktop: 'Desktop',
    mobile: 'Mobile',
    titleCount: 'chars',
    titleOptimal: 'Optimal (≤60)',
    titleLong: 'Too long (>60)',
    descOptimal: 'Optimal (≤160)',
    descLong: 'Too long (>160)',
  },
  ar: {
    title: 'محاكي نتائج البحث',
    titleInput: 'عنوان الصفحة',
    urlInput: 'رابط الصفحة',
    descInput: 'وصف التعريف',
    desktop: 'سطح المكتب',
    mobile: 'الهاتف',
    titleCount: 'حرف',
    titleOptimal: 'مثالي (≤60)',
    titleLong: 'طويل جداً (>60)',
    descOptimal: 'مثالي (≤160)',
    descLong: 'طويل جداً (>160)',
  },
};

export default function SerpSimulator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const truncateTitle = (text: string, maxPx: number) => {
    const charWidth = isMobile ? 7.5 : 8.2;
    const maxChars = Math.floor(maxPx / charWidth);
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars - 1) + '...';
  };

  const truncateDesc = (text: string, max: number) => {
    if (text.length <= max) return text;
    return text.slice(0, max - 1) + '...';
  };

  const displayUrl = url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : 'example.com';
  const titleColor = title.length > 60 ? 'text-red-500' : title.length > 50 ? 'text-amber-500' : 'text-emerald-500';
  const descColor = description.length > 160 ? 'text-red-500' : description.length > 140 ? 'text-amber-500' : 'text-emerald-500';

  const previewTitle = truncateTitle(title || 'Page Title', isMobile ? 430 : 600);
  const previewDesc = truncateDesc(description || 'Your meta description will appear here in search results...', isMobile ? 120 : 160);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Monitor className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t.titleInput}</Label>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${titleColor}`}>{title.length}/60</span>
                <Badge variant={title.length > 60 ? 'destructive' : 'default'} className="text-[10px]">
                  {title.length > 60 ? t.titleLong : t.titleOptimal}
                </Badge>
              </div>
            </div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t.titleInput} className="tool-input" />
          </div>
          <div className="space-y-2">
            <Label>{t.urlInput}</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/page" className="tool-input" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{t.descInput}</Label>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${descColor}`}>{description.length}/160</span>
                <Badge variant={description.length > 160 ? 'destructive' : 'default'} className="text-[10px]">
                  {description.length > 160 ? t.descLong : t.descOptimal}
                </Badge>
              </div>
            </div>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t.descInput} className="tool-input" />
          </div>
          <div className="flex gap-2">
            <Button variant={isMobile ? 'outline' : 'default'} size="sm" onClick={() => setIsMobile(false)} className="flex items-center gap-2">
              <Monitor className="size-4" />
              {t.desktop}
            </Button>
            <Button variant={isMobile ? 'default' : 'outline'} size="sm" onClick={() => setIsMobile(true)} className="flex items-center gap-2">
              <Smartphone className="size-4" />
              {t.mobile}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title text-base">{isMobile ? t.mobile : t.desktop} Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`tool-output mx-auto ${isMobile ? 'max-w-[360px]' : 'max-w-[600px]'}`}>
            <div className="rounded-lg border bg-white dark:bg-gray-950 p-4">
              {/* Breadcrumb */}
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span className="truncate">{displayUrl}</span>
              </div>
              {/* Title */}
              <div className="text-lg leading-snug text-blue-700 dark:text-blue-400 hover:underline cursor-pointer mb-1 line-clamp-1" style={{ fontSize: isMobile ? '16px' : '20px' }}>
                {previewTitle}
              </div>
              {/* Description */}
              <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2" style={{ fontSize: isMobile ? '13px' : '14px' }}>
                {previewDesc}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

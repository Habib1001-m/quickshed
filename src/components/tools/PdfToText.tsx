'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Upload, Copy, Check } from 'lucide-react';

const labels = {
  en: {
    title: 'PDF to Text',
    dropzone: 'Drag & drop a PDF file or click to upload',
    extracting: 'Extracting text...',
    copyAll: 'Copy All',
    copied: 'Copied!',
    page: 'Page',
    allPages: 'All Pages',
    noPdf: 'Upload a PDF to extract text',
    error: 'Error extracting text from PDF',
  },
  ar: {
    title: 'تحويل PDF إلى نص',
    dropzone: 'اسحب وأسقط ملف PDF أو انقر للرفع',
    extracting: 'جارٍ استخراج النص...',
    copyAll: 'نسخ الكل',
    copied: 'تم النسخ!',
    page: 'صفحة',
    allPages: 'جميع الصفحات',
    noPdf: 'ارفع ملف PDF لاستخراج النص',
    error: 'خطأ في استخراج النص من PDF',
  },
};

export default function PdfToText({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') return;
    setLoading(true);
    setError('');
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, useSystemFonts: true }).promise;
      const textPages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items
          .map((item) => ('str' in item ? item.str : ''))
          .join(' ');
        textPages.push(text);
      }
      setPages(textPages);
      setCurrentPage(0);
    } catch (e) {
      setError(t.error);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [t.error]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(pages.join('\n\n'));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No false positive success.
    }
  };

  const allText = pages.join('\n\n');

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <FileText className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf';
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleFile(file);
              };
              input.click();
            }}
          >
            <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t.dropzone}</p>
          </div>

          {loading && (
            <div className="text-center text-sm text-muted-foreground">{t.extracting}</div>
          )}
          {error && (
            <div className="text-center text-sm text-red-500">{error}</div>
          )}
        </CardContent>
      </Card>

      {pages.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="tool-section-title text-base">{t.allPages} ({pages.length})</CardTitle>
            <Button variant="ghost" size="sm" onClick={copyAll}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? <span className="copy-feedback">{t.copied}</span> : t.copyAll}
            </Button>
          </CardHeader>
          <CardContent>
            <Tabs value={currentPage === 0 ? 'all' : `page-${currentPage}`} onValueChange={(v) => {
              if (v === 'all') setCurrentPage(0);
              else setCurrentPage(parseInt(v.replace('page-', '')));
            }}>
              <TabsList className="flex flex-wrap gap-1 h-auto">
                <TabsTrigger value="all" className="text-xs">{t.allPages}</TabsTrigger>
                {pages.map((_, i) => (
                  <TabsTrigger key={i} value={`page-${i + 1}`} className="text-xs">{t.page} {i + 1}</TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value="all">
                <pre className="tool-output whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">{allText}</pre>
              </TabsContent>
              {pages.map((text, i) => (
                <TabsContent key={i} value={`page-${i + 1}`}>
                  <pre className="tool-output whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">{text}</pre>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

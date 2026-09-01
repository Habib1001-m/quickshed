'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileMinus, Upload, Download } from 'lucide-react';

const labels = {
  en: {
    title: 'PDF Page Remover',
    dropzone: 'Drag & drop a PDF file or click to upload',
    totalPages: 'Total Pages',
    selectToRemove: 'Select pages to remove',
    page: 'Page',
    remove: 'Remove Selected Pages',
    download: 'Download New PDF',
    noPdf: 'Upload a PDF to get started',
    removing: 'Removing pages...',
    error: 'Error processing PDF',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
  },
  ar: {
    title: 'حاذف صفحات PDF',
    dropzone: 'اسحب وأسقط ملف PDF أو انقر للرفع',
    totalPages: 'إجمالي الصفحات',
    selectToRemove: 'حدد الصفحات للحذف',
    page: 'صفحة',
    remove: 'حذف الصفحات المحددة',
    download: 'تحميل PDF الجديد',
    noPdf: 'ارفع ملف PDF للبدء',
    removing: 'جارٍ حذف الصفحات...',
    error: 'خطأ في معالجة PDF',
    selectAll: 'تحديد الكل',
    deselectAll: 'إلغاء تحديد الكل',
  },
};

export default function PdfPageRemover({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') return;
    try {
      const PDFLib = await import('pdf-lib');
      const data = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(data);
      setPdfData(data);
      setTotalPages(pdf.getPageCount());
      setSelectedPages(new Set());
      setResultUrl(null);
    } catch (e) {
      setError(t.error);
      console.error(e);
    }
  }, [t.error]);

  const togglePage = (page: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const selectAll = () => {
    const all = new Set<number>();
    for (let i = 1; i <= totalPages; i++) all.add(i);
    setSelectedPages(all);
  };

  const deselectAll = () => setSelectedPages(new Set());

  const handleRemove = async () => {
    if (!pdfData || selectedPages.size === 0) return;
    if (selectedPages.size >= totalPages) {
      setError('Cannot remove all pages');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const PDFLib = await import('pdf-lib');
      const src = await PDFLib.PDFDocument.load(pdfData);
      const newPdf = await PDFLib.PDFDocument.create();
      for (let i = 0; i < totalPages; i++) {
        if (!selectedPages.has(i + 1)) {
          const [page] = await newPdf.copyPages(src, [i]);
          newPdf.addPage(page);
        }
      }
      const bytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
      setResultUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(t.error);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = 'pages_removed.pdf';
    a.click();
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <FileMinus className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
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
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t.dropzone}</p>
          </div>

          {pdfData && (
            <>
              <div className="text-sm font-medium">{t.totalPages}: {totalPages}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAll}>{t.selectAll}</Button>
                <Button variant="outline" size="sm" onClick={deselectAll}>{t.deselectAll}</Button>
              </div>
              <div className="text-sm text-muted-foreground">{t.selectToRemove} ({selectedPages.size})</div>
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-64 overflow-y-auto">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <div
                    key={page}
                    className={`flex items-center justify-center gap-1 p-2 rounded border text-sm cursor-pointer transition-colors ${
                      selectedPages.has(page) ? 'bg-red-500/10 border-red-500/30 text-red-600' : 'hover:bg-muted'
                    }`}
                    onClick={() => togglePage(page)}
                  >
                    <Checkbox checked={selectedPages.has(page)} onCheckedChange={() => togglePage(page)} className="pointer-events-none" />
                    <span className="text-xs">{page}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleRemove} disabled={selectedPages.size === 0 || loading} className="tool-action-btn flex items-center gap-2">
                  <FileMinus className="size-4" />
                  {loading ? t.removing : t.remove}
                </Button>
                {resultUrl && (
                  <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                    <Download className="size-4" />{t.download}
                  </Button>
                )}
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

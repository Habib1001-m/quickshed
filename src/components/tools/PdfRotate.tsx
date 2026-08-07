'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RotateCw, Upload, Download } from 'lucide-react';

const labels = {
  en: {
    title: 'PDF Rotate',
    dropzone: 'Drag & drop a PDF file or click to upload',
    totalPages: 'Total Pages',
    angle: 'Rotation Angle',
    applyTo: 'Apply To',
    allPages: 'All Pages',
    specificPages: 'Specific Pages',
    rotate: 'Rotate',
    download: 'Download Rotated PDF',
    page: 'Page',
    rotating: 'Rotating...',
    error: 'Error processing PDF',
    invalidFile: 'Please choose a PDF file.',
    fileTooLarge: 'File is too large. Maximum size is 25 MB.',
  },
  ar: {
    title: 'تدوير PDF',
    dropzone: 'اسحب وأسقط ملف PDF أو انقر للرفع',
    totalPages: 'إجمالي الصفحات',
    angle: 'زاوية الدوران',
    applyTo: 'تطبيق على',
    allPages: 'جميع الصفحات',
    specificPages: 'صفحات محددة',
    rotate: 'تدوير',
    download: 'تحميل PDF المدوّر',
    page: 'صفحة',
    rotating: 'جارٍ التدوير...',
    error: 'خطأ في معالجة PDF',
    invalidFile: 'يرجى اختيار ملف PDF.',
    fileTooLarge: 'الملف كبير جدًا. الحد الأقصى للحجم هو 25 ميجابايت.',
  },
};

const ANGLES = [
  { label: '90°', value: 90 },
  { label: '180°', value: 180 },
  { label: '270°', value: 270 },
];
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export default function PdfRotate({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [angle, setAngle] = useState(90);
  const [applyMode, setApplyMode] = useState<'all' | 'specific'>('all');
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError(t.invalidFile);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(t.fileTooLarge);
      return;
    }
    setError('');
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
  }, [t.error, t.fileTooLarge, t.invalidFile]);

  const openFilePicker = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,application/pdf';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFile(file);
    };
    input.click();
  }, [handleFile]);

  const togglePage = (page: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page);
      else next.add(page);
      return next;
    });
  };

  const handleRotate = async () => {
    if (!pdfData) return;
    setLoading(true);
    setError('');
    try {
      const PDFLib = await import('pdf-lib');
      const pdf = await PDFLib.PDFDocument.load(pdfData);
      const pages = pdf.getPages();
      pages.forEach((page, i) => {
        if (applyMode === 'all' || selectedPages.has(i + 1)) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(PDFLib.degrees(currentRotation + angle));
        }
      });
      const bytes = await pdf.save();
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
    a.download = 'rotated.pdf';
    a.click();
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <RotateCw className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragOver ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
            }`}
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFilePicker();
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={t.dropzone}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
          >
            <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t.dropzone}</p>
          </div>

          {pdfData && (
            <>
              <div className="text-sm font-medium">{t.totalPages}: {totalPages}</div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.angle}</label>
                  <Select value={angle.toString()} onValueChange={(v) => setAngle(parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ANGLES.map((a) => (
                        <SelectItem key={a.value} value={a.value.toString()}>{a.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{t.applyTo}</label>
                  <Select value={applyMode} onValueChange={(v) => setApplyMode(v as 'all' | 'specific')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t.allPages}</SelectItem>
                      <SelectItem value="specific">{t.specificPages}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {applyMode === 'specific' && (
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-48 overflow-y-auto">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <div
                      key={page}
                      className={`flex items-center justify-center gap-1 p-2 rounded border text-sm cursor-pointer transition-colors ${
                        selectedPages.has(page) ? 'bg-primary/10 border-primary/30' : 'hover:bg-muted'
                      }`}
                      onClick={() => togglePage(page)}
                    >
                      <Checkbox checked={selectedPages.has(page)} onCheckedChange={() => togglePage(page)} className="pointer-events-none" />
                      <span className="text-xs">{page}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleRotate} disabled={loading || (applyMode === 'specific' && selectedPages.size === 0)} className="tool-action-btn flex items-center gap-2">
                  <RotateCw className="size-4" />
                  {loading ? t.rotating : t.rotate}
                </Button>
                {resultUrl && (
                  <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                    <Download className="size-4" />{t.download}
                  </Button>
                )}
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-500" role="alert">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

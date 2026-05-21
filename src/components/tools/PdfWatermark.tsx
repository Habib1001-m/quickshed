'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Droplets, Upload, Download } from 'lucide-react';

const labels = {
  en: {
    title: 'PDF Watermark',
    dropzone: 'Drag & drop a PDF file or click to upload',
    watermarkText: 'Watermark Text',
    fontSize: 'Font Size',
    opacity: 'Opacity',
    rotation: 'Rotation',
    color: 'Color',
    gray: 'Gray',
    red: 'Red',
    blue: 'Blue',
    apply: 'Apply Watermark',
    download: 'Download Watermarked PDF',
    noPdf: 'Upload a PDF to get started',
    applying: 'Applying watermark...',
    error: 'Error processing PDF',
  },
  ar: {
    title: 'علامة مائية على PDF',
    dropzone: 'اسحب وأسقط ملف PDF أو انقر للرفع',
    watermarkText: 'نص العلامة المائية',
    fontSize: 'حجم الخط',
    opacity: 'الشفافية',
    rotation: 'الدوران',
    color: 'اللون',
    gray: 'رمادي',
    red: 'أحمر',
    blue: 'أزرق',
    apply: 'تطبيق العلامة المائية',
    download: 'تحميل PDF بالعلامة المائية',
    noPdf: 'ارفع ملف PDF للبدء',
    applying: 'جارٍ تطبيق العلامة المائية...',
    error: 'خطأ في معالجة PDF',
  },
};

const ROTATIONS = [
  { label: '0°', value: 0 },
  { label: '45°', value: 45 },
  { label: '-45°', value: -45 },
  { label: '90°', value: 90 },
];

const COLORS = [
  { label: 'gray', value: [0.5, 0.5, 0.5] as [number, number, number] },
  { label: 'red', value: [0.8, 0.2, 0.2] as [number, number, number] },
  { label: 'blue', value: [0.2, 0.2, 0.8] as [number, number, number] },
];

export default function PdfWatermark({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(30);
  const [rotation, setRotation] = useState(45);
  const [colorKey, setColorKey] = useState('gray');
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
      setResultUrl(null);
    } catch (e) {
      setError(t.error);
      console.error(e);
    }
  }, [t.error]);

  const handleApply = async () => {
    if (!pdfData || !watermarkText) return;
    setLoading(true);
    setError('');
    try {
      const PDFLib = await import('pdf-lib');
      const pdf = await PDFLib.PDFDocument.load(pdfData);
      const helveticaFont = await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const color = COLORS.find((c) => c.label === colorKey)?.value || [0.5, 0.5, 0.5];

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
        const x = (width - textWidth) / 2;
        const y = height / 2;

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          font: helveticaFont,
          color: PDFLib.rgb(color[0], color[1], color[2]),
          opacity: opacity / 100,
          rotate: PDFLib.degrees(rotation),
        });
      }

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
    a.download = 'watermarked.pdf';
    a.click();
  };

  const getColorLabel = (key: string) => {
    if (key === 'gray') return t.gray;
    if (key === 'red') return t.red;
    return t.blue;
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Droplets className="size-5" />
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
              <div className="space-y-2">
                <Label>{t.watermarkText}</Label>
                <Input value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder={t.watermarkText} className="tool-input" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>{t.fontSize}</Label>
                    <span className="text-sm text-muted-foreground">{fontSize}</span>
                  </div>
                  <Slider value={[fontSize]} onValueChange={([v]) => setFontSize(v)} min={12} max={120} step={1} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>{t.opacity}</Label>
                    <span className="text-sm text-muted-foreground">{opacity}%</span>
                  </div>
                  <Slider value={[opacity]} onValueChange={([v]) => setOpacity(v)} min={5} max={100} step={5} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.rotation}</Label>
                  <Select value={rotation.toString()} onValueChange={(v) => setRotation(parseInt(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROTATIONS.map((r) => (
                        <SelectItem key={r.value} value={r.value.toString()}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t.color}</Label>
                  <Select value={colorKey} onValueChange={setColorKey}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {COLORS.map((c) => (
                        <SelectItem key={c.label} value={c.label}>{getColorLabel(c.label)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">PDF: {totalPages} page(s)</div>

              <div className="flex gap-2">
                <Button onClick={handleApply} disabled={!watermarkText || loading} className="tool-action-btn flex items-center gap-2">
                  <Droplets className="size-4" />
                  {loading ? t.applying : t.apply}
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

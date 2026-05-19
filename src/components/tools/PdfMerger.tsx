'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Files, Upload, Download, Trash2 } from 'lucide-react';

const labels = {
  en: {
    title: 'PDF Merger',
    addFiles: 'Add PDF Files',
    merge: 'Merge PDFs',
    download: 'Download Merged PDF',
    file: 'File',
    pages: 'pages',
    remove: 'Remove',
    noFiles: 'Add 2 or more PDF files to merge',
    merging: 'Merging...',
    error: 'Error merging PDFs',
  },
  ar: {
    title: 'دمج ملفات PDF',
    addFiles: 'إضافة ملفات PDF',
    merge: 'دمج ملفات PDF',
    download: 'تحميل الملف المدمج',
    file: 'ملف',
    pages: 'صفحات',
    remove: 'حذف',
    noFiles: 'أضف ملفين أو أكثر من PDF للدمج',
    merging: 'جارٍ الدمج...',
    error: 'خطأ في دمج ملفات PDF',
  },
};

interface PdfFileEntry {
  id: string;
  name: string;
  data: ArrayBuffer;
  pages: number;
}

export default function PdfMerger({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [files, setFiles] = useState<PdfFileEntry[]>([]);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addFiles = useCallback(async (fileList: FileList) => {
    const PDFLib = await import('pdf-lib');
    const newEntries: PdfFileEntry[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (file.type !== 'application/pdf') continue;
      const data = await file.arrayBuffer();
      try {
        const pdf = await PDFLib.PDFDocument.load(data);
        newEntries.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          data,
          pages: pdf.getPageCount(),
        });
      } catch {
        // skip invalid PDFs
      }
    }
    setFiles((prev) => [...prev, ...newEntries]);
    setMergedUrl(null);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setMergedUrl(null);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setLoading(true);
    setError('');
    try {
      const PDFLib = await import('pdf-lib');
      const merged = await PDFLib.PDFDocument.create();
      for (const file of files) {
        const src = await PDFLib.PDFDocument.load(file.data);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes], { type: 'application/pdf' });
      setMergedUrl(URL.createObjectURL(blob));
    } catch (e) {
      setError(t.error);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!mergedUrl) return;
    const a = document.createElement('a');
    a.href = mergedUrl;
    a.download = 'merged.pdf';
    a.click();
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Files className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf';
              input.multiple = true;
              input.onchange = (e) => {
                const fileList = (e.target as HTMLInputElement).files;
                if (fileList) addFiles(fileList);
              };
              input.click();
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t.addFiles}</p>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, i) => (
                <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">{i + 1}.</span>
                  <FileIcon className="size-4 text-red-500 shrink-0" />
                  <span className="flex-1 text-sm truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{file.pages} {t.pages}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="text-red-500 shrink-0">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={handleMerge} disabled={files.length < 2 || loading} className="tool-action-btn flex items-center gap-2">
              <Files className="size-4" />
              {loading ? t.merging : t.merge}
            </Button>
            {mergedUrl && (
              <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
                <Download className="size-4" />{t.download}
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

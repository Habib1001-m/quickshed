'use client';

import { useState, useRef } from 'react';
import { Download, Upload, Check, AlertCircle } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

const STORAGE_KEYS = [
  'quickshed-locale',
  'quickshed-favorites',
  'quickshed-recent',
  'quickshed-usage',
  'quickshed-ratings',
  'quickshed-welcomed',
];

export function ExportImport() {
  const { locale } = useI18n();
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data: Record<string, unknown> = {};
      STORAGE_KEYS.forEach((key) => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      });

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `quickshed-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 2000);
    } catch {
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (typeof data !== 'object' || data === null) {
          throw new Error('Invalid format');
        }

        // Validate the data has at least one QuickShed key
        const hasQuickShedKey = Object.keys(data).some((key) => key.startsWith('quickshed-'));
        if (!hasQuickShedKey) {
          throw new Error('Not a QuickShed backup');
        }

        // Import each key
        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith('quickshed-')) {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          }
        });

        setImportStatus('success');
        setTimeout(() => {
          setImportStatus('idle');
          // Reload to apply imported data
          window.location.reload();
        }, 1500);
      } catch {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleExport}
        >
          {exportStatus === 'success' ? (
            <Check className="size-3.5 text-emerald-500" />
          ) : exportStatus === 'error' ? (
            <AlertCircle className="size-3.5 text-red-500" />
          ) : (
            <Download className="size-3.5" />
          )}
          {exportStatus === 'success'
            ? (locale === 'ar' ? 'تم التصدير!' : 'Exported!')
            : exportStatus === 'error'
            ? (locale === 'ar' ? 'خطأ' : 'Error')
            : (locale === 'ar' ? 'تصدير البيانات' : 'Export Data')
          }
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex-1 justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleImport}
        >
          {importStatus === 'success' ? (
            <Check className="size-3.5 text-emerald-500" />
          ) : importStatus === 'error' ? (
            <AlertCircle className="size-3.5 text-red-500" />
          ) : (
            <Upload className="size-3.5" />
          )}
          {importStatus === 'success'
            ? (locale === 'ar' ? 'تم الاستيراد!' : 'Imported!')
            : importStatus === 'error'
            ? (locale === 'ar' ? 'ملف غير صالح' : 'Invalid file')
            : (locale === 'ar' ? 'استيراد البيانات' : 'Import Data')
          }
        </Button>
      </div>

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {importStatus === 'success' && (
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
          {locale === 'ar' ? 'سيتم إعادة تحميل الصفحة...' : 'Page will reload to apply...'}
        </p>
      )}
    </div>
  );
}

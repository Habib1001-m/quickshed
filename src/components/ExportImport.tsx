'use client';

import { useState, useRef } from 'react';
import { Download, Upload, Check, AlertCircle } from 'lucide-react';
import { useI18n, type TranslateFn } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  parseBackupFile,
  applyBackup,
  type BackupEntry,
  type ParseFailure,
} from '@/lib/backup-import';

function readQuickShedBackupData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith('quickshed-')) continue;

    const value = localStorage.getItem(key);
    if (value === null) continue;

    try {
      data[key] = JSON.parse(value);
    } catch {
      data[key] = value;
    }
  }

  return data;
}

function describeFailure(failure: ParseFailure, t: TranslateFn): string {
  if (failure.reason === 'unknown-keys') {
    return t('common.backupErrorUnknownKeys', {
      keys: (failure.unknownKeys ?? []).join(', '),
    });
  }
  // invalid-json, not-object, no-quickshed-keys, malformed
  return t('common.backupErrorInvalid');
}

export function ExportImport() {
  const { t, locale } = useI18n();
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Pending import awaiting user confirmation. null = no dialog. Nothing is
  // written to storage until the user confirms.
  const [pending, setPending] = useState<{ entries: BackupEntry[]; replaceCount: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const data = readQuickShedBackupData();

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
    // Reset the input so the same file can be re-selected.
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = String(event.target?.result ?? '');
      const parsed = parseBackupFile(text);

      if (!parsed.ok) {
        // Rejected before any storage write.
        setErrorMsg(describeFailure(parsed, t));
        setImportStatus('error');
        setPending(null);
        return;
      }

      // Valid payload: count how many keys already exist so the confirmation
      // can tell the user what will be replaced. Still no writes yet.
      let replaceCount = 0;
      try {
        for (const entry of parsed.entries) {
          if (localStorage.getItem(entry.key) !== null) replaceCount += 1;
        }
      } catch {
        // Storage may be unavailable even after the file parsed successfully.
        // Keep the import path non-throwing and leave storage untouched.
        setErrorMsg(t('common.backupErrorFailed'));
        setImportStatus('error');
        setPending(null);
        return;
      }
      setErrorMsg(null);
      setImportStatus('idle');
      setPending({ entries: parsed.entries, replaceCount });
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!pending) return;
    // Transactional: snapshot + write-all + rollback-on-failure.
    setPending(null);

    let result: ReturnType<typeof applyBackup>;
    try {
      result = applyBackup(pending.entries, localStorage);
    } catch {
      // A storage implementation may throw while taking the pre-import
      // snapshot (for example when browser storage is disabled). Keep the
      // confirmation path non-throwing; no writes are applied in that case.
      setImportStatus('error');
      setErrorMsg(t('common.backupErrorFailed'));
      return;
    }

    if (result.ok) {
      setErrorMsg(null);
      setImportStatus('success');
      setTimeout(() => {
        setImportStatus('idle');
        // Reload to apply imported data cleanly, avoiding stale Zustand state.
        window.location.reload();
      }, 1500);
    } else {
      setImportStatus('error');
      setErrorMsg(t('common.backupErrorFailed'));
    }
  };

  const handleCancelImport = () => {
    // Cancel is a complete no-op on storage.
    setPending(null);
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
            ? (locale === 'ar' ? 'فشل الاستيراد' : 'Import failed')
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

      {importStatus === 'error' && errorMsg && (
        <p role="alert" className="text-[11px] text-red-600 dark:text-red-400">
          {errorMsg}
        </p>
      )}

      {/* Explicit confirmation before the first storage write. Cancel is a no-op. */}
      <AlertDialog
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) handleCancelImport();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.backupImportTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('common.backupImportSummary', {
                count: pending?.entries.length ?? 0,
                replaceCount: pending?.replaceCount ?? 0,
              })}
              <br />
              <span className="text-amber-600 dark:text-amber-400">
                {t('common.backupImportWarning')}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelImport}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmImport}>
              {t('common.backupImportAction')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

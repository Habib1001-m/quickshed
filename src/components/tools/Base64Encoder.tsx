'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, FileUp, Binary } from 'lucide-react';

const labels = {
  en: {
    title: 'Base64 Encoder / Decoder',
    encode: 'Encode',
    decode: 'Decode',
    inputPlaceholder: 'Enter text to encode/decode...',
    outputPlaceholder: 'Result will appear here...',
    copy: 'Copy',
    copied: 'Copied!',
    fileToBase64: 'File to Base64',
    dragDrop: 'Drag & drop a file here, or click to select',
    fileSize: 'File size',
    fileName: 'File name',
    fileType: 'File type',
    invalidBase64: 'Invalid Base64 input',
    textMode: 'Text',
    fileMode: 'File',
  },
  ar: {
    title: 'مشفر / مفك تشفير Base64',
    encode: 'ترميز',
    decode: 'فك الترميز',
    inputPlaceholder: 'أدخل النص للترميز/فك الترميز...',
    outputPlaceholder: 'ستظهر النتيجة هنا...',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    fileToBase64: 'ملف إلى Base64',
    dragDrop: 'اسحب وأسقط ملفاً هنا، أو انقر للاختيار',
    fileSize: 'حجم الملف',
    fileName: 'اسم الملف',
    fileType: 'نوع الملف',
    invalidBase64: 'إدخال Base64 غير صالح',
    textMode: 'نص',
    fileMode: 'ملف',
  },
};

type Direction = 'encode' | 'decode';
type Mode = 'text' | 'file';

function encodeToBase64(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return '';
  }
}

function decodeFromBase64(base64: string): string {
  try {
    return decodeURIComponent(escape(atob(base64.trim())));
  } catch {
    return '';
  }
}

/* ---------- main component ---------- */
export default function Base64Encoder({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [direction, setDirection] = useState<Direction>('encode');
  const [mode, setMode] = useState<Mode>('text');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processText = useCallback((text: string, dir: Direction) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }
    if (dir === 'encode') {
      const result = encodeToBase64(text);
      setOutput(result);
      setError(result ? '' : t.invalidBase64);
    } else {
      const result = decodeFromBase64(text);
      if (result) {
        setOutput(result);
        setError('');
      } else {
        setOutput('');
        setError(t.invalidBase64);
      }
    }
  }, [t.invalidBase64]);

  const handleDirectionChange = useCallback((newDir: string) => {
    const dir = newDir as Direction;
    setDirection(dir);
    setOutput('');
    setError('');
    if (mode === 'text' && input) {
      processText(input, dir);
    }
  }, [input, mode, processText]);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    processText(value, direction);
  }, [direction, processText]);

  const handleFile = useCallback((file: File) => {
    setFileInfo({
      name: file.name,
      size: file.size < 1024 ? `${file.size} B` : file.size < 1048576 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1048576).toFixed(1)} MB`,
      type: file.type || 'unknown',
    });

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      setOutput(base64);
      setError('');
    };
    reader.onerror = () => {
      setError(t.invalidBase64);
      setOutput('');
    };
    reader.readAsDataURL(file);
  }, [t.invalidBase64]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title">
            <Binary className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={direction} onValueChange={handleDirectionChange}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">{t.encode}</TabsTrigger>
              <TabsTrigger value="decode">{t.decode}</TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">{t.textMode}</TabsTrigger>
              <TabsTrigger value="file">{t.fileMode}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {mode === 'text' ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Textarea
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="tool-input min-h-[160px] resize-y text-sm font-mono"
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 space-y-4">
            {direction === 'encode' ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
              >
                <FileUp className="size-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t.dragDrop}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            ) : (
              <Textarea
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="tool-input min-h-[160px] resize-y text-sm font-mono"
              />
            )}

            {fileInfo && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{t.fileName}: {fileInfo.name}</Badge>
                <Badge variant="secondary">{t.fileSize}: {fileInfo.size}</Badge>
                <Badge variant="secondary">{t.fileType}: {fileInfo.type}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {output && (
        <Card className="tool-wrapper-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm">
              {direction === 'encode' ? t.encode : t.decode}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="size-4 me-1 text-emerald-500" /> : <Copy className="size-4 me-1" />}
              {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Textarea
              value={output}
              readOnly
              placeholder={t.outputPlaceholder}
              className="tool-output min-h-[160px] resize-y text-sm font-mono"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

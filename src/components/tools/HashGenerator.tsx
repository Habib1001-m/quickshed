'use client';

import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Hash, FileUp } from 'lucide-react';

const labels = {
  en: {
    title: 'Hash Generator',
    inputPlaceholder: 'Enter text to hash...',
    generate: 'Generate Hashes',
    copy: 'Copy',
    copied: 'Copied!',
    fileHash: 'File Hash',
    dragDrop: 'Drag & drop a file here, or click to select',
    fileName: 'File name',
    fileSize: 'File size',
    textMode: 'Text',
    fileMode: 'File',
    noInput: 'Please enter text or drop a file',
    md5: 'MD5',
    sha1: 'SHA-1',
    sha256: 'SHA-256',
    sha512: 'SHA-512',
  },
  ar: {
    title: 'مولد التجزئة',
    inputPlaceholder: 'أدخل النص للتجزئة...',
    generate: 'توليد التجزئة',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    fileHash: 'تجزئة الملف',
    dragDrop: 'اسحب وأسقط ملفاً هنا، أو انقر للاختيار',
    fileName: 'اسم الملف',
    fileSize: 'حجم الملف',
    textMode: 'نص',
    fileMode: 'ملف',
    noInput: 'يرجى إدخال نص أو إسقاط ملف',
    md5: 'MD5',
    sha1: 'SHA-1',
    sha256: 'SHA-256',
    sha512: 'SHA-512',
  },
};

/* ========== MD5 Implementation (no external dependency) ========== */
function md5(string: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  function add32(a: number, b: number) {
    return (a + b) & 0xFFFFFFFF;
  }

  function md5blk(s: string) {
    const md5blks: number[] = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  function rhex(n: number) {
    const hexChr = '0123456789abcdef';
    let s = '';
    for (let j = 0; j < 4; j++) {
      s += hexChr.charAt((n >> (j * 8 + 4)) & 0x0F) + hexChr.charAt((n >> (j * 8)) & 0x0F);
    }
    return s;
  }

  function hex(x: number[]) {
    return x.map(rhex).join('');
  }

  let n = string.length;
  let state = [1732584193, -271733879, -1732584194, 271733878];
  let i: number;

  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(string.substring(i - 64, i)));
  }

  string = string.substring(i - 64);
  const tail = new Array(16).fill(0);
  for (i = 0; i < string.length; i++) {
    tail[i >> 2] |= string.charCodeAt(i) << ((i % 4) << 3);
  }
  tail[i >> 2] |= 0x80 << ((i % 4) << 3);
  if (i > 55) {
    md5cycle(state, tail);
    tail.fill(0);
  }
  tail[14] = n * 8;
  md5cycle(state, tail);
  return hex(state);
}

/* ========== SHA using Web Crypto ========== */
async function shaHash(algorithm: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest(algorithm, encoder.encode(data));
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function shaHashBuffer(algorithm: string, buffer: ArrayBuffer): Promise<string> {
  const hash = await crypto.subtle.digest(algorithm, buffer);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ========== Hash Result Row ========== */
function HashRow({ label, value, t }: { label: string; value: string; t: typeof labels.en }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Badge variant="secondary">{label}</Badge>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
        </Button>
      </div>
      <code className="tool-output block text-xs font-mono break-all">{value}</code>
    </div>
  );
}

/* ========== Main Component ========== */
export default function HashGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string> | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string } | null>(null);
  const [generating, setGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateTextHashes = useCallback(async (text: string) => {
    if (!text) { setHashes(null); return; }
    setGenerating(true);
    try {
      const [sha1, sha256, sha512] = await Promise.all([
        shaHash('SHA-1', text),
        shaHash('SHA-256', text),
        shaHash('SHA-512', text),
      ]);
      const md5Hash = md5(text);
      setHashes({ md5: md5Hash, sha1, sha256, sha512 });
    } catch {
      setHashes(null);
    }
    setGenerating(false);
  }, []);

  const generateFileHashes = useCallback(async (file: File) => {
    setGenerating(true);
    setFileInfo({
      name: file.name,
      size: file.size < 1024 ? `${file.size} B` : file.size < 1048576 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / 1048576).toFixed(1)} MB`,
    });
    try {
      const buffer = await file.arrayBuffer();
      const [sha1, sha256, sha512] = await Promise.all([
        shaHashBuffer('SHA-1', buffer),
        shaHashBuffer('SHA-256', buffer),
        shaHashBuffer('SHA-512', buffer),
      ]);
      // MD5 for file - compute from bytes
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const md5Hash = md5(binary);
      setHashes({ md5: md5Hash, sha1, sha256, sha512 });
    } catch {
      setHashes(null);
    }
    setGenerating(false);
  }, []);

  const handleGenerate = useCallback(() => {
    if (mode === 'text') {
      generateTextHashes(input);
    }
  }, [mode, input, generateTextHashes]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) generateFileHashes(file);
  }, [generateFileHashes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) generateFileHashes(file);
  }, [generateFileHashes]);

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title">
            <Hash className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={mode === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('text')}
            >
              {t.textMode}
            </Button>
            <Button
              variant={mode === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('file')}
            >
              {t.fileMode}
            </Button>
          </div>

          {mode === 'text' ? (
            <>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="tool-input min-h-[120px] resize-y text-sm font-mono"
              />
              <Button onClick={handleGenerate} disabled={!input.trim() || generating} className="tool-action-btn">
                {t.generate}
              </Button>
            </>
          ) : (
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
          )}

          {fileInfo && mode === 'file' && (
            <div className="flex gap-2">
              <Badge variant="secondary">{t.fileName}: {fileInfo.name}</Badge>
              <Badge variant="secondary">{t.fileSize}: {fileInfo.size}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {hashes && (
        <Card className="tool-wrapper-card">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <HashRow label={t.md5} value={hashes.md5} t={t} />
            <HashRow label={t.sha1} value={hashes.sha1} t={t} />
            <HashRow label={t.sha256} value={hashes.sha256} t={t} />
            <HashRow label={t.sha512} value={hashes.sha512} t={t} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

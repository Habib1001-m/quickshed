'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Copy, Check } from 'lucide-react';

type Style = 'apa' | 'mla' | 'chicago';

interface CitationData {
  author: string;
  title: string;
  year: string;
  publisher: string;
  url: string;
  journal: string;
  volume: string;
  pages: string;
}

function generateAPA(d: CitationData): string {
  let citation = '';
  if (d.author) citation += `${d.author}. `;
  if (d.year) citation += `(${d.year}). `;
  if (d.title) citation += `${d.title}. `;
  if (d.journal) {
    citation += `${d.journal}`;
    if (d.volume) citation += `, ${d.volume}`;
    citation += '. ';
  } else if (d.publisher) {
    citation += `${d.publisher}. `;
  }
  if (d.pages) citation += `pp. ${d.pages}. `;
  if (d.url) citation += `${d.url}`;
  return citation.trim();
}

function generateMLA(d: CitationData): string {
  let citation = '';
  if (d.author) citation += `${d.author}. `;
  if (d.title) citation += `"${d.title}." `;
  if (d.journal) {
    citation += `${d.journal}`;
    if (d.volume) citation += `, vol. ${d.volume}`;
    citation += ', ';
  }
  if (d.year) citation += `${d.year}, `;
  if (d.pages) citation += `pp. ${d.pages}. `;
  if (d.publisher && !d.journal) citation += `${d.publisher}, ${d.year || 'n.d.'}. `;
  if (d.url) citation += `${d.url}`;
  return citation.trim();
}

function generateChicago(d: CitationData): string {
  let citation = '';
  if (d.author) citation += `${d.author}. `;
  if (d.title) citation += `"${d.title}." `;
  if (d.journal) {
    citation += `${d.journal}`;
    if (d.volume) citation += ` ${d.volume}`;
    citation += ' ';
  }
  if (d.year) citation += `(${d.year}). `;
  if (d.publisher && !d.journal) citation += `${d.publisher}, `;
  if (d.pages) citation += `${d.pages}. `;
  if (d.url) citation += `${d.url}`;
  return citation.trim();
}

export default function CitationGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [style, setStyle] = useState<Style>('apa');
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<CitationData>({
    author: '',
    title: '',
    year: '',
    publisher: '',
    url: '',
    journal: '',
    volume: '',
    pages: '',
  });

  const updateField = (field: keyof CitationData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const generateCitation = () => {
    switch (style) {
      case 'apa': return generateAPA(data);
      case 'mla': return generateMLA(data);
      case 'chicago': return generateChicago(data);
    }
  };

  const citation = generateCitation();

  const fields: { key: keyof CitationData; label: string; labelAr: string }[] = [
    { key: 'author', label: 'Author', labelAr: 'المؤلف' },
    { key: 'title', label: 'Title', labelAr: 'العنوان' },
    { key: 'year', label: 'Year', labelAr: 'السنة' },
    { key: 'publisher', label: 'Publisher', labelAr: 'الناشر' },
    { key: 'url', label: 'URL', labelAr: 'الرابط' },
    { key: 'journal', label: 'Journal', labelAr: 'المجلة' },
    { key: 'volume', label: 'Volume', labelAr: 'المجلد' },
    { key: 'pages', label: 'Pages', labelAr: 'الصفحات' },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(citation).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <BookOpen className="size-5 text-amber-500" />
        <h2 className="tool-section-title text-lg font-semibold">
          {isAr ? 'مولد الاستشهادات' : 'Citation Generator'}
        </h2>
      </div>

      {/* Style selector */}
      <div className="flex gap-2">
        {(['apa', 'mla', 'chicago'] as Style[]).map((s) => (
          <Button
            key={s}
            variant={style === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStyle(s)}
            className={style === s ? 'bg-amber-600 hover:bg-amber-700' : ''}
          >
            {s.toUpperCase()}
          </Button>
        ))}
      </div>

      {/* Input fields */}
      <Card className="tool-wrapper-card">
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <Label className="text-xs">{isAr ? f.labelAr : f.label}</Label>
                <Input
                  value={data[f.key]}
                  onChange={(e) => updateField(f.key, e.target.value)}
                  placeholder={isAr ? f.labelAr : f.label}
                  className="tool-input"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generated citation */}
      {citation && (
        <Card className="tool-output border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground">
                {isAr ? 'الاستشهاد المُنشأ' : 'Generated Citation'} ({style.toUpperCase()})
              </CardTitle>
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-1">
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? <span className="copy-feedback">{isAr ? 'تم النسخ' : 'Copied'}</span> : (isAr ? 'نسخ' : 'Copy')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed font-serif">{citation}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

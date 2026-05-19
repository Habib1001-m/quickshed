'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Check, Download, Plus, Trash2, FileText } from 'lucide-react';

interface Rule {
  id: string;
  userAgent: string;
  rules: { type: 'Allow' | 'Disallow'; path: string }[];
  crawlDelay?: string;
  sitemap?: string;
}

const labels = {
  en: {
    title: 'robots.txt Generator',
    userAgent: 'User-agent',
    ruleType: 'Rule Type',
    path: 'Path',
    allow: 'Allow',
    disallow: 'Disallow',
    crawlDelay: 'Crawl-delay (seconds)',
    sitemap: 'Sitemap URL',
    addRule: 'Add Rule',
    addPath: 'Add Path',
    removePath: 'Remove',
    generatedCode: 'Generated robots.txt',
    copyCode: 'Copy',
    copied: 'Copied!',
    download: 'Download',
    presets: 'Quick Presets',
    allowAll: 'Allow All',
    blockAll: 'Block All',
    blockAI: 'Block AI Crawlers',
    allBots: 'All Bots',
    newUserAgent: 'New User-agent',
  },
  ar: {
    title: 'مولّد robots.txt',
    userAgent: 'وكيل المستخدم',
    ruleType: 'نوع القاعدة',
    path: 'المسار',
    allow: 'سماح',
    disallow: 'منع',
    crawlDelay: 'تأخير الزحف (ثواني)',
    sitemap: 'رابط خريطة الموقع',
    addRule: 'إضافة قاعدة',
    addPath: 'إضافة مسار',
    removePath: 'حذف',
    generatedCode: 'robots.txt المُنشأ',
    copyCode: 'نسخ',
    copied: 'تم النسخ!',
    download: 'تحميل',
    presets: 'قوالب سريعة',
    allowAll: 'السماح للجميع',
    blockAll: 'منع الجميع',
    blockAI: 'منع زواحف الذكاء الاصطناعي',
    allBots: 'جميع البوتات',
    newUserAgent: 'وكيل مستخدم جديد',
  },
};

export default function RobotsTxtGenerator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [rules, setRules] = useState<Rule[]>([
    { id: '1', userAgent: '*', rules: [{ type: 'Allow', path: '/' }], crawlDelay: '', sitemap: '' },
  ]);
  const [copied, setCopied] = useState(false);

  const generatedCode = useMemo(() => {
    const lines: string[] = [];
    rules.forEach((rule) => {
      lines.push(`User-agent: ${rule.userAgent}`);
      rule.rules.forEach((r) => {
        lines.push(`${r.type}: ${r.path}`);
      });
      if (rule.crawlDelay) lines.push(`Crawl-delay: ${rule.crawlDelay}`);
      lines.push('');
    });
    const sitemaps = rules.filter((r) => r.sitemap);
    sitemaps.forEach((r) => {
      lines.push(`Sitemap: ${r.sitemap}`);
    });
    return lines.join('\n').trim();
  }, [rules]);

  const addNewSection = () => {
    setRules([...rules, { id: Date.now().toString(), userAgent: '*', rules: [{ type: 'Disallow', path: '' }], crawlDelay: '', sitemap: '' }]);
  };

  const removeSection = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const updateSection = (id: string, field: keyof Rule, value: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addPathToSection = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, rules: [...r.rules, { type: 'Disallow' as const, path: '' }] } : r)));
  };

  const removePathFromSection = (id: string, index: number) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, rules: r.rules.filter((_, i) => i !== index) } : r)));
  };

  const updatePathInSection = (id: string, index: number, field: 'type' | 'path', value: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, rules: r.rules.map((rule, i) => (i === index ? { ...rule, [field]: value } : rule)) } : r)));
  };

  const applyPreset = (preset: 'allowAll' | 'blockAll' | 'blockAI') => {
    if (preset === 'allowAll') {
      setRules([{ id: Date.now().toString(), userAgent: '*', rules: [{ type: 'Allow', path: '/' }], crawlDelay: '', sitemap: '' }]);
    } else if (preset === 'blockAll') {
      setRules([{ id: Date.now().toString(), userAgent: '*', rules: [{ type: 'Disallow', path: '/' }], crawlDelay: '', sitemap: '' }]);
    } else {
      setRules([
        { id: '1', userAgent: 'GPTBot', rules: [{ type: 'Disallow', path: '/' }], crawlDelay: '', sitemap: '' },
        { id: '2', userAgent: 'ChatGPT-User', rules: [{ type: 'Disallow', path: '/' }], crawlDelay: '', sitemap: '' },
        { id: '3', userAgent: 'CCBot', rules: [{ type: 'Disallow', path: '/' }], crawlDelay: '', sitemap: '' },
        { id: '4', userAgent: 'Google-Extended', rules: [{ type: 'Disallow', path: '/' }], crawlDelay: '', sitemap: '' },
        { id: '5', userAgent: 'Omgilibot', rules: [{ type: 'Disallow', path: '/' }], crawlDelay: '', sitemap: '' },
        { id: '6', userAgent: 'FacebookBot', rules: [{ type: 'Disallow', path: '/' }], crawlDelay: '', sitemap: '' },
        { id: '7', userAgent: '*', rules: [{ type: 'Allow', path: '/' }], crawlDelay: '', sitemap: '' },
      ]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

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
          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground self-center">{t.presets}:</span>
            <Button variant="outline" size="sm" onClick={() => applyPreset('allowAll')}>{t.allowAll}</Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset('blockAll')}>{t.blockAll}</Button>
            <Button variant="outline" size="sm" onClick={() => applyPreset('blockAI')}>{t.blockAI}</Button>
          </div>

          {rules.map((section) => (
            <Card key={section.id} className="border-dashed">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <Label className="whitespace-nowrap">{t.userAgent}</Label>
                    <Input
                      value={section.userAgent}
                      onChange={(e) => updateSection(section.id, 'userAgent', e.target.value)}
                      placeholder="*"
                      className="tool-input max-w-[200px]"
                    />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeSection(section.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {section.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Select value={rule.type} onValueChange={(v) => updatePathInSection(section.id, idx, 'type', v)}>
                      <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Allow">{t.allow}</SelectItem>
                        <SelectItem value="Disallow">{t.disallow}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={rule.path}
                      onChange={(e) => updatePathInSection(section.id, idx, 'path', e.target.value)}
                      placeholder="/path/"
                      className="tool-input flex-1"
                    />
                    <Button variant="ghost" size="sm" onClick={() => removePathFromSection(section.id, idx)} className="text-red-500 shrink-0">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" size="sm" onClick={() => addPathToSection(section.id)} className="flex items-center gap-1">
                  <Plus className="size-3" />{t.addPath}
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t.crawlDelay}</Label>
                    <Input value={section.crawlDelay} onChange={(e) => updateSection(section.id, 'crawlDelay', e.target.value)} placeholder="10" type="number" className="tool-input" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t.sitemap}</Label>
                    <Input value={section.sitemap} onChange={(e) => updateSection(section.id, 'sitemap', e.target.value)} placeholder="https://example.com/sitemap.xml" className="tool-input" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={addNewSection} className="flex items-center gap-2 w-full">
            <Plus className="size-4" />{t.addRule}
          </Button>
        </CardContent>
      </Card>

      <Card className="tool-wrapper-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="tool-section-title text-base">{t.generatedCode}</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? <span className="copy-feedback">{t.copied}</span> : t.copyCode}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload}>
              <Download className="size-4" />{t.download}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="tool-output rounded-lg bg-muted p-4 text-xs overflow-x-auto whitespace-pre-wrap">{generatedCode}</pre>
        </CardContent>
      </Card>
    </div>
  );
}

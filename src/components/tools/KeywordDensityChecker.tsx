'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

const STOP_WORDS = new Set([
  'the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did',
  'will','would','shall','should','may','might','can','could','must','and','but','or','nor','for',
  'yet','so','in','on','at','to','of','it','its','this','that','these','those','i','you','he','she',
  'we','they','me','him','her','us','them','my','your','his','our','their','not','no','with','as',
  'by','from','up','about','into','over','after','than','too','very','just','also','now','here',
  'there','when','where','why','how','all','each','every','both','few','more','most','other','some',
  'such','only','own','same','then','which','what','who','whom','if','or','because','while','during',
  'لا','في','من','على','إلى','عن','مع','هذا','هذه','ذلك','تلك','هو','هي','أنا','أنت','نحن','هم',
  'كان','كانت','يكون','تكون','قد','لقد','لم','لن','ما','أن','إن','كل','بعض','أي','غير','حتى',
  'بين','عند','خلال','التي','الذي','الذين','اللذين','اللتين','هؤلاء','أولئك',
]);

const labels = {
  en: {
    title: 'Keyword Density Checker',
    placeholder: 'Paste your content here to analyze keyword density...',
    totalWords: 'Total Words',
    uniqueWords: 'Unique Words',
    oneWord: '1-Word Phrases',
    twoWord: '2-Word Phrases',
    threeWord: '3-Word Phrases',
    keyword: 'Keyword',
    count: 'Count',
    density: 'Density',
    noData: 'Enter content to see keyword analysis',
  },
  ar: {
    title: 'فاحص كثافة الكلمات المفتاحية',
    placeholder: 'الصق المحتوى هنا لتحليل كثافة الكلمات المفتاحية...',
    totalWords: 'إجمالي الكلمات',
    uniqueWords: 'كلمات فريدة',
    oneWord: 'عبارات كلمة واحدة',
    twoWord: 'عبارات كلمتين',
    threeWord: 'عبارات 3 كلمات',
    keyword: 'الكلمة المفتاحية',
    count: 'العدد',
    density: 'الكثافة',
    noData: 'أدخل محتوى لرؤية تحليل الكلمات المفتاحية',
  },
};

function getPhrases(words: string[], n: number): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = 0; i <= words.length - n; i++) {
    const phrase = words.slice(i, i + n).join(' ');
    if (n === 1 && STOP_WORDS.has(phrase)) continue;
    if (n > 1) {
      const phraseWords = phrase.split(' ');
      if (phraseWords.every((w) => STOP_WORDS.has(w))) continue;
    }
    map.set(phrase, (map.get(phrase) || 0) + 1);
  }
  return map;
}

export default function KeywordDensityChecker({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];
  const [content, setContent] = useState('');

  const analysis = useMemo(() => {
    if (!content.trim()) return null;
    const words = content.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).filter((w) => w.length > 0);
    const totalWords = words.length;

    const oneWordMap = getPhrases(words, 1);
    const twoWordMap = getPhrases(words, 2);
    const threeWordMap = getPhrases(words, 3);

    const sortByCount = (map: Map<string, number>) =>
      Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20);

    const uniqueWords = oneWordMap.size;

    return {
      totalWords,
      uniqueWords,
      oneWord: sortByCount(oneWordMap),
      twoWord: sortByCount(twoWordMap),
      threeWord: sortByCount(threeWordMap),
    };
  }, [content]);

  const renderTable = (data: [string, number][], totalWords: number) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-start py-2 px-3 text-muted-foreground font-medium">#</th>
            <th className="text-start py-2 px-3 text-muted-foreground font-medium">{t.keyword}</th>
            <th className="text-start py-2 px-3 text-muted-foreground font-medium">{t.count}</th>
            <th className="text-start py-2 px-3 text-muted-foreground font-medium">{t.density}</th>
          </tr>
        </thead>
        <tbody>
          {data.map(([word, count], i) => {
            const density = ((count / totalWords) * 100).toFixed(2);
            const barWidth = Math.min((count / (data[0]?.[1] || 1)) * 100, 100);
            return (
              <tr key={word + i} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-2 px-3 text-muted-foreground">{i + 1}</td>
                <td className="py-2 px-3 font-medium">{word}</td>
                <td className="py-2 px-3">{count}</td>
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-primary/20 rounded-full flex-1 max-w-[80px]">
                      <div className="h-2 bg-primary rounded-full" style={{ width: `${barWidth}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{density}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Search className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.placeholder}
            className="tool-input min-h-[200px] resize-y text-base"
          />
        </CardContent>
      </Card>

      {analysis && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{analysis.totalWords}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.totalWords}</div>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-primary">{analysis.uniqueWords}</div>
                <div className="text-xs text-muted-foreground mt-1">{t.uniqueWords}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="one">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="one">{t.oneWord}</TabsTrigger>
              <TabsTrigger value="two">{t.twoWord}</TabsTrigger>
              <TabsTrigger value="three">{t.threeWord}</TabsTrigger>
            </TabsList>
            <TabsContent value="one">
              <Card><CardContent className="p-4">{renderTable(analysis.oneWord, analysis.totalWords)}</CardContent></Card>
            </TabsContent>
            <TabsContent value="two">
              <Card><CardContent className="p-4">{renderTable(analysis.twoWord, analysis.totalWords)}</CardContent></Card>
            </TabsContent>
            <TabsContent value="three">
              <Card><CardContent className="p-4">{renderTable(analysis.threeWord, analysis.totalWords)}</CardContent></Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {!analysis && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">{t.noData}</CardContent>
        </Card>
      )}
    </div>
  );
}

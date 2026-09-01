'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Layers, Plus, Trash2, RotateCcw, Download, Upload, CheckCircle2, XCircle } from 'lucide-react';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  known: boolean | null;
}

export default function FlashcardMaker({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [studyMode, setStudyMode] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const addCard = () => {
    if (!front.trim() || !back.trim()) return;
    setCards((prev) => [
      ...prev,
      { id: Date.now().toString(), front: front.trim(), back: back.trim(), known: null },
    ]);
    setFront('');
    setBack('');
  };

  const removeCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
  };

  const markCard = (known: boolean) => {
    setCards((prev) =>
      prev.map((c, i) => (i === currentIdx ? { ...c, known } : c))
    );
    nextCard();
  };

  const nextCard = () => {
    setFlipped(false);
    setCurrentIdx((prev) => (prev + 1) % cards.length);
  };

  const startStudy = () => {
    setStudyMode(true);
    setCurrentIdx(0);
    setFlipped(false);
    setCards((prev) => prev.map((c) => ({ ...c, known: null })));
  };

  const exitStudy = () => {
    setStudyMode(false);
    setCurrentIdx(0);
    setFlipped(false);
  };

  const exportCards = () => {
    const json = JSON.stringify(cards.map(({ front, back }) => ({ front, back })), null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCards = () => {
    fileRef.current?.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (Array.isArray(parsed)) {
          const imported = parsed.map((item: { front: string; back: string }) => ({
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            front: item.front || '',
            back: item.back || '',
            known: null,
          }));
          setCards((prev) => [...prev, ...imported]);
        }
      } catch {
        // Invalid JSON
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const knownCount = cards.filter((c) => c.known === true).length;
  const unknownCount = cards.filter((c) => c.known === false).length;

  // Study mode
  if (studyMode && cards.length > 0) {
    const card = cards[currentIdx];
    return (
      <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between">
          <h2 className="tool-section-title text-lg font-semibold">
            {isAr ? 'وضع الدراسة' : 'Study Mode'}
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="size-3 text-emerald-500" /> {knownCount}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <XCircle className="size-3 text-destructive" /> {unknownCount}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentIdx + 1}/{cards.length}
            </span>
            <Button variant="outline" size="sm" onClick={exitStudy}>
              {isAr ? 'خروج' : 'Exit'}
            </Button>
          </div>
        </div>

        <Card
          className="min-h-[250px] cursor-pointer select-none"
          onClick={() => setFlipped(!flipped)}
        >
          <CardContent className="flex items-center justify-center min-h-[250px] p-8">
            <div className="text-center space-y-2">
              <div className="text-xs text-muted-foreground mb-2">
                {flipped
                  ? isAr ? 'الخلف (الإجابة)' : 'Back (Answer)'
                  : isAr ? 'الأمام (السؤال)' : 'Front (Question)'}
              </div>
              <p className="text-xl font-medium leading-relaxed">
                {flipped ? card.back : card.front}
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                {isAr ? 'انقر للقلب' : 'Click to flip'}
              </p>
            </div>
          </CardContent>
        </Card>

        {flipped && (
          <div className="flex justify-center gap-3">
            <Button
              variant="destructive"
              onClick={() => markCard(false)}
              className="gap-2"
            >
              <XCircle className="size-4" />
              {isAr ? 'لم أعرف' : "Don't Know"}
            </Button>
            <Button
              onClick={() => markCard(true)}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="size-4" />
              {isAr ? 'عرفته' : 'Know It'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Create/Edit mode
  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <Layers className="size-5 text-amber-500" />
        <h2 className="tool-section-title text-lg font-semibold">
          {isAr ? 'صانع البطاقات التعليمية' : 'Flashcard Maker'}
        </h2>
      </div>

      {/* Add card */}
      <Card className="tool-wrapper-card">
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>{isAr ? 'الأمام (سؤال)' : 'Front (Question)'}</Label>
              <Input
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder={isAr ? 'أدخل السؤال...' : 'Enter question...'}
                onKeyDown={(e) => e.key === 'Enter' && addCard()}
                className="tool-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>{isAr ? 'الخلف (إجابة)' : 'Back (Answer)'}</Label>
              <Input
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder={isAr ? 'أدخل الإجابة...' : 'Enter answer...'}
                onKeyDown={(e) => e.key === 'Enter' && addCard()}
                className="tool-input"
              />
            </div>
          </div>
          <Button onClick={addCard} className="tool-action-btn gap-2 bg-emerald-600 hover:bg-emerald-700" disabled={!front.trim() || !back.trim()}>
            <Plus className="size-4" />
            {isAr ? 'إضافة بطاقة' : 'Add Card'}
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      {cards.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={startStudy} className="tool-action-btn gap-2 bg-amber-600 hover:bg-amber-700">
            {isAr ? 'بدء الدراسة' : 'Study'}
          </Button>
          <Button variant="outline" onClick={exportCards} className="gap-2">
            <Download className="size-4" />
            {isAr ? 'تصدير' : 'Export'}
          </Button>
          <Button variant="outline" onClick={importCards} className="gap-2">
            <Upload className="size-4" />
            {isAr ? 'استيراد' : 'Import'}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <Button variant="outline" onClick={() => setCards([])} className="gap-2 text-destructive">
            <RotateCcw className="size-4" />
            {isAr ? 'مسح الكل' : 'Clear All'}
          </Button>
        </div>
      )}

      {/* Card list */}
      {cards.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {cards.map((c, i) => (
            <Card key={c.id}>
              <CardContent className="py-2.5 px-4 flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-6 text-center">{i + 1}</span>
                <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
                  <span className="text-sm truncate">{c.front}</span>
                  <span className="text-sm truncate text-muted-foreground">{c.back}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive size-7 shrink-0"
                  onClick={() => removeCard(c.id)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Layers className="size-8 mx-auto mb-2 opacity-40" />
            <p>{isAr ? 'أضف بطاقات للبدء' : 'Add cards to get started'}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

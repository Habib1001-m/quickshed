'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Volume2, Radio } from 'lucide-react';

const labels = {
  en: {
    title: 'Morse Code Translator',
    textToMorse: 'Text → Morse',
    morseToText: 'Morse → Text',
    inputLabel: 'Input',
    outputLabel: 'Output',
    textPlaceholder: 'Enter text (A-Z, 0-9, punctuation)...',
    morsePlaceholder: 'Enter morse code (use . and -)...',
    copy: 'Copy',
    copied: 'Copied!',
    play: 'Play Audio',
    playing: 'Playing...',
    invalidMorse: 'Invalid morse code characters',
  },
  ar: {
    title: 'مترجم شفرة مورس',
    textToMorse: 'نص ← مورس',
    morseToText: 'مورس ← نص',
    inputLabel: 'المدخل',
    outputLabel: 'الناتج',
    textPlaceholder: 'أدخل نصاً (A-Z, 0-9, علامات ترقيم)...',
    morsePlaceholder: 'أدخل شفرة مورس (استخدم . و -)...',
    copy: 'نسخ',
    copied: 'تم النسخ!',
    play: 'تشغيل الصوت',
    playing: 'جاري التشغيل...',
    invalidMorse: 'أحرف شفرة مورس غير صالحة',
  },
};

const MORSE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
};

const REVERSE_MORSE: Record<string, string> = {};
for (const [key, val] of Object.entries(MORSE_MAP)) {
  REVERSE_MORSE[val] = key;
}

function textToMorse(text: string): string {
  return [...text.toUpperCase()].map((char) => {
    if (char === ' ') return '/';
    return MORSE_MAP[char] || '';
  }).filter(Boolean).join(' ');
}

function morseToText(morse: string): string {
  return morse.split(' ').map((code) => {
    if (code === '/') return ' ';
    return REVERSE_MORSE[code] || '';
  }).filter(Boolean).join('');
}

function playMorseAudio(morse: string) {
  try {
    const ctx = new AudioContext();
    const dotDuration = 0.08;
    let time = ctx.currentTime;

    for (const char of morse) {
      if (char === '.') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 660;
        osc.type = 'sine';
        gain.gain.value = 0.3;
        osc.start(time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dotDuration);
        osc.stop(time + dotDuration + 0.01);
        time += dotDuration * 2;
      } else if (char === '-') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 660;
        osc.type = 'sine';
        gain.gain.value = 0.3;
        osc.start(time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dotDuration * 3);
        osc.stop(time + dotDuration * 3 + 0.01);
        time += dotDuration * 4;
      } else if (char === ' ') {
        time += dotDuration * 2;
      } else if (char === '/') {
        time += dotDuration * 6;
      }
    }
  } catch {
    // Audio not available
  }
}

export default function MorseCodeTranslator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [mode, setMode] = useState('toMorse');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const output = useMemo(() => {
    if (!input.trim()) return '';
    if (mode === 'toMorse') {
      return textToMorse(input);
    } else {
      return morseToText(input);
    }
  }, [input, mode]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No false positive success.
    }
  }, [output]);

  const handlePlay = useCallback(() => {
    const morseToPlay = mode === 'toMorse' ? output : input;
    if (!morseToPlay) return;
    setIsPlaying(true);
    playMorseAudio(morseToPlay);
    const totalDuration = morseToPlay.length * 100;
    setTimeout(() => setIsPlaying(false), Math.min(totalDuration, 10000));
  }, [mode, output, input]);

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Radio className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="toMorse">{t.textToMorse}</TabsTrigger>
              <TabsTrigger value="toText">{t.morseToText}</TabsTrigger>
            </TabsList>

            <TabsContent value="toMorse" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.inputLabel}</label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.textPlaceholder}
                  className="tool-input min-h-[120px] resize-y font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="toText" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.inputLabel}</label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t.morsePlaceholder}
                  className="tool-input min-h-[120px] resize-y font-mono text-sm"
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Output */}
      {output && (
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">{t.outputLabel}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePlay} className="gap-1" disabled={isPlaying}>
                <Volume2 className="size-3" />
                {isPlaying ? t.playing : t.play}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1">
                {copied ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
              {copied ? <span className="copy-feedback">{t.copied}</span> : t.copy}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={output}
              readOnly
              className="tool-output min-h-[120px] resize-y font-mono text-sm bg-muted/50 break-all"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

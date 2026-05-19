'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Hourglass, Play, Pause, RotateCcw, Bell } from 'lucide-react';

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // Audio not available
  }
}

export default function CountdownTimer({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);
  const accumulatedRef = useRef(0);

  const totalInputMs = (hours * 3600 + minutes * 60 + seconds) * 1000;

  const start = useCallback(() => {
    if (totalInputMs <= 0) return;
    const total = remaining > 0 && !done ? remaining : totalInputMs;
    setTotalMs(total);
    setRemaining(total);
    setDone(false);
    setFlashing(false);
    startRef.current = Date.now();
    accumulatedRef.current = total;
    setRunning(true);
  }, [totalInputMs, remaining, done]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
    setRemaining(0);
    setTotalMs(0);
    setDone(false);
    setFlashing(false);
  }, []);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const newRemaining = accumulatedRef.current - elapsed;
      if (newRemaining <= 0) {
        setRemaining(0);
        setRunning(false);
        setDone(true);
        setFlashing(true);
        playBeep();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setRemaining(newRemaining);
      }
    }, 50);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (!flashing) return;
    const id = setTimeout(() => setFlashing(false), 10000);
    return () => clearTimeout(id);
  }, [flashing]);

  const formatDisplay = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPct = totalMs > 0 ? ((totalMs - remaining) / totalMs) * 100 : 0;

  const displayMs = done ? 0 : remaining;

  return (
    <Card className="tool-wrapper-card" dir={isAr ? 'rtl' : 'ltr'}>
      <CardHeader className="pb-3">
        <CardTitle className="tool-section-title">
          <Hourglass className="size-5" />
          {isAr ? 'مؤقت العد التنازلي' : 'Countdown Timer'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

      <Card className={flashing ? 'animate-pulse border-destructive' : ''}>
        <CardContent className="py-8 flex flex-col items-center gap-6">
          {/* Big display */}
          <div className="text-5xl sm:text-7xl font-mono font-bold tracking-tight text-foreground">
            {formatDisplay(displayMs)}
          </div>

          {/* Progress */}
          {totalMs > 0 && (
            <div className="w-full max-w-md">
              <Progress value={progressPct} className="h-3" />
            </div>
          )}

          {/* Done alert */}
          {done && (
            <div className="flex items-center gap-2 text-destructive animate-bounce">
              <Bell className="size-6" />
              <span className="font-semibold">
                {isAr ? 'انتهى الوقت!' : "Time's up!"}
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {!running && !done && (
              <Button
                onClick={start}
                size="lg"
                className="tool-action-btn gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="size-5" />
                {isAr ? 'بدء' : 'Start'}
              </Button>
            )}
            {running && (
              <Button onClick={pause} size="lg" variant="destructive" className="gap-2">
                <Pause className="size-5" />
                {isAr ? 'إيقاف مؤقت' : 'Pause'}
              </Button>
            )}
            {!running && done && (
              <Button
                onClick={start}
                size="lg"
                className="tool-action-btn gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="size-5" />
                {isAr ? 'إعادة تشغيل' : 'Restart'}
              </Button>
            )}
            {!running && (totalMs > 0 || done) && (
              <Button onClick={reset} size="lg" variant="outline" className="gap-2">
                <RotateCcw className="size-5" />
                {isAr ? 'إعادة تعيين' : 'Reset'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time input */}
      {!running && !done && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {isAr ? 'ضبط الوقت' : 'Set Time'}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? 'ساعات' : 'Hours'}</Label>
                <Input
                  type="number"
                  min={0}
                  max={99}
                  value={hours}
                  onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="tool-input text-center font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? 'دقائق' : 'Minutes'}</Label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes}
                  onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="tool-input text-center font-mono"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? 'ثوانٍ' : 'Seconds'}</Label>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="tool-input text-center font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      </CardContent>
    </Card>
  );
}

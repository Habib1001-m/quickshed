'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Timer, Play, Pause, RotateCcw, Flag } from 'lucide-react';

interface Lap {
  number: number;
  time: number;
  delta: number;
}

export default function Stopwatch({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const accumulatedRef = useRef(0);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    accumulatedRef.current = elapsed;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 10);
  }, [elapsed]);

  const stop = useCallback(() => {
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
    setElapsed(0);
    setLaps([]);
  }, []);

  const lap = useCallback(() => {
    const lastLapTime = laps.length > 0 ? laps[0].time : 0;
    setLaps((prev) => [
      { number: prev.length + 1, time: elapsed, delta: elapsed - lastLapTime },
      ...prev,
    ]);
  }, [elapsed, laps]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="tool-section-title">
        <Timer className="size-5 text-sky-500" />
        <h2 className="text-lg font-semibold">
          {isAr ? 'ساعة الإيقاف' : 'Stopwatch'}
        </h2>
      </div>

      {/* Display */}
      <Card className="tool-wrapper-card">
        <CardContent className="p-4 sm:p-6 py-8 flex flex-col items-center gap-4">
          <span className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-foreground">
            {formatTime(elapsed)}
          </span>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {!running ? (
              <Button
                onClick={start}
                size="lg"
                className="tool-action-btn gap-2"
              >
                <Play className="size-5" />
                {elapsed === 0
                  ? isAr ? 'بدء' : 'Start'
                  : isAr ? 'استئناف' : 'Resume'}
              </Button>
            ) : (
              <Button
                onClick={stop}
                size="lg"
                variant="destructive"
                className="gap-2"
              >
                <Pause className="size-5" />
                {isAr ? 'إيقاف' : 'Stop'}
              </Button>
            )}
            {running && (
              <Button onClick={lap} size="lg" variant="outline" className="gap-2">
                <Flag className="size-5" />
                {isAr ? 'لفة' : 'Lap'}
              </Button>
            )}
            {!running && elapsed > 0 && (
              <Button onClick={reset} size="lg" variant="outline" className="gap-2">
                <RotateCcw className="size-5" />
                {isAr ? 'إعادة تعيين' : 'Reset'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Laps */}
      {laps.length > 0 && (
        <Card className="tool-wrapper-card">
          <CardContent className="p-4 sm:p-6 pt-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              {isAr ? 'أوقات اللفات' : 'Lap Times'}
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-1">
              {laps.map((l) => (
                <div
                  key={l.number}
                  className="flex items-center justify-between py-1.5 px-3 rounded-md hover:bg-muted/50 text-sm"
                >
                  <span className="text-muted-foreground">
                    {isAr ? 'لفة' : 'Lap'} {l.number}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    +{formatTime(l.delta)}
                  </span>
                  <span className="font-mono font-medium">{formatTime(l.time)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

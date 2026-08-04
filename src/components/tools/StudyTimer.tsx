'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Timer, Play, Pause, RotateCcw, Settings, Coffee, BookOpen } from 'lucide-react';

type Phase = 'study' | 'break' | 'longBreak';

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 660;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available
  }
}

export default function StudyTimer({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';

  const [studyMin, setStudyMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);

  const [phase, setPhase] = useState<Phase>('study');
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [totalStudyToday, setTotalStudyToday] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);
  const accumulatedRef = useRef(0);

  // Refs to access latest values inside the interval callback
  // Updated via useEffect to satisfy lint rules
  const phaseRef = useRef<Phase>(phase);
  const studyMinRef = useRef(studyMin);
  const breakMinRef = useRef(breakMin);
  const longBreakMinRef = useRef(longBreakMin);
  const sessionsRef = useRef(sessions);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { studyMinRef.current = studyMin; }, [studyMin]);
  useEffect(() => { breakMinRef.current = breakMin; }, [breakMin]);
  useEffect(() => { longBreakMinRef.current = longBreakMin; }, [longBreakMin]);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);

  const getPhaseDuration = (p: Phase, sMin: number, bMin: number, lbMin: number) => {
    switch (p) {
      case 'study': return sMin * 60;
      case 'break': return bMin * 60;
      case 'longBreak': return lbMin * 60;
    }
  };

  const totalSec = getPhaseDuration(phase, studyMin, breakMin, longBreakMin);
  const progressPct = totalSec > 0 ? ((totalSec - remaining) / totalSec) * 100 : 0;

  const formatDisplay = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const start = () => {
    startRef.current = Date.now();
    accumulatedRef.current = remaining;
    setRunning(true);
  };

  const pause = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  };

  const reset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
    setRemaining(getPhaseDuration(phase, studyMin, breakMin, longBreakMin));
  };

  // Main timer effect — all state transitions happen inside the interval callback
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const newRemaining = accumulatedRef.current - elapsed;
      if (newRemaining <= 0) {
        playBeep();

        const currentPhase = phaseRef.current;
        const currentStudyMin = studyMinRef.current;
        const currentBreakMin = breakMinRef.current;
        const currentLongBreakMin = longBreakMinRef.current;
        const currentSessions = sessionsRef.current;

        if (currentPhase === 'study') {
          const newSessions = currentSessions + 1;
          setSessions(newSessions);
          setTotalStudyToday((prev) => prev + currentStudyMin);

          if (newSessions % 4 === 0) {
            setPhase('longBreak');
            setRemaining(currentLongBreakMin * 60);
          } else {
            setPhase('break');
            setRemaining(currentBreakMin * 60);
          }
        } else {
          setPhase('study');
          setRemaining(currentStudyMin * 60);
        }

        setRunning(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        setRemaining(newRemaining);
      }
    }, 200);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const phaseLabel = () => {
    switch (phase) {
      case 'study': return isAr ? 'وقت الدراسة' : 'Study Time';
      case 'break': return isAr ? 'استراحة قصيرة' : 'Short Break';
      case 'longBreak': return isAr ? 'استراحة طويلة' : 'Long Break';
    }
  };

  const phaseIcon = () => {
    switch (phase) {
      case 'study': return <BookOpen className="size-5" />;
      case 'break': return <Coffee className="size-5" />;
      case 'longBreak': return <Coffee className="size-5" />;
    }
  };

  const phaseColor = () => {
    switch (phase) {
      case 'study': return 'text-sky-500';
      case 'break': return 'text-emerald-500';
      case 'longBreak': return 'text-amber-500';
    }
  };

  const formatTotalStudy = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h >  0) return isAr ? `${h} ساعة ${m} دقيقة` : `${h}h ${m}m`;
    return isAr ? `${m} دقيقة` : `${m} min`;
  };

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="size-5 text-amber-500" />
          <h2 className="tool-section-title text-lg font-semibold">
            {isAr ? 'مؤقت الدراسة (بومودورو)' : 'Study Timer (Pomodoro)'}
          </h2>
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="size-4" />
        </Button>
      </div>

      {/* Settings */}
      {showSettings && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <h3 className="text-sm font-medium">{isAr ? 'إعدادات المدة' : 'Duration Settings'}</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? 'دراسة (د)' : 'Study (min)'}</Label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={studyMin}
                  onChange={(e) => {
                    const v = Math.max(1, parseInt(e.target.value) || 1);
                    setStudyMin(v);
                    if (phase === 'study' && !running) setRemaining(v * 60);
                  }}
                  className="tool-input text-center font-mono h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? 'استراحة (د)' : 'Break (min)'}</Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={breakMin}
                  onChange={(e) => {
                    const v = Math.max(1, parseInt(e.target.value) || 1);
                    setBreakMin(v);
                    if (phase === 'break' && !running) setRemaining(v * 60);
                  }}
                  className="tool-input text-center font-mono h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? 'استراحة طويلة (د)' : 'Long Break (min)'}</Label>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={longBreakMin}
                  onChange={(e) => {
                    const v = Math.max(1, parseInt(e.target.value) || 1);
                    setLongBreakMin(v);
                    if (phase === 'longBreak' && !running) setRemaining(v * 60);
                  }}
                  className="tool-input text-center font-mono h-8"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timer display */}
      <Card className="overflow-hidden">
        <div
          className={`h-2 ${
            phase === 'study' ? 'bg-sky-500' : phase === 'break' ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
          style={{ width: `${progressPct}%`, transition: 'width 0.3s' }}
        />
        <CardContent className="py-8 flex flex-col items-center gap-4">
          <div className={`flex items-center gap-2 ${phaseColor()}`}>
            {phaseIcon()}
            <span className="font-medium">{phaseLabel()}</span>
          </div>

          <div className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-foreground">
            {formatDisplay(remaining)}
          </div>

          <Progress value={progressPct} className="w-full max-w-sm h-2" />

          {/* Controls */}
          <div className="flex items-center gap-3">
            {!running ? (
              <Button
                onClick={start}
                size="lg"
                className="tool-action-btn gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <Play className="size-5" />
                {isAr ? 'بدء' : 'Start'}
              </Button>
            ) : (
              <Button onClick={pause} size="lg" variant="destructive" className="gap-2">
                <Pause className="size-5" />
                {isAr ? 'إيقاف مؤقت' : 'Pause'}
              </Button>
            )}
            <Button onClick={reset} size="lg" variant="outline" className="gap-2">
              <RotateCcw className="size-5" />
              {isAr ? 'إعادة تعيين' : 'Reset'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <div className="text-2xl font-bold">{sessions}</div>
            <div className="text-[10px] text-muted-foreground">
              {isAr ? 'جلسات اليوم' : 'Sessions Today'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <div className="text-2xl font-bold">{formatTotalStudy(totalStudyToday)}</div>
            <div className="text-[10px] text-muted-foreground">
              {isAr ? 'وقت الدراسة اليوم' : 'Study Time Today'}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 sm:col-span-1">
          <CardContent className="pt-3 pb-3 text-center">
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`size-3 rounded-full ${
                    i < sessions % 4
                      ? 'bg-sky-500'
                      : 'bg-muted-foreground/20'
                  }`}
                />
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {isAr ? 'حتى الاستراحة الطويلة' : 'Until Long Break'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

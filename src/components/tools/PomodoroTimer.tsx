'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Timer, Settings, Coffee, BookOpen } from 'lucide-react';

const labels = {
  en: {
    title: 'Pomodoro Timer',
    work: 'Work',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
    start: 'Start',
    pause: 'Pause',
    reset: 'Reset',
    sessions: 'Sessions',
    customize: 'Customize',
    workMin: 'Work (min)',
    breakMin: 'Break (min)',
    longBreakMin: 'Long Break (min)',
  },
  ar: {
    title: 'مؤقت بومودورو',
    work: 'عمل',
    shortBreak: 'استراحة قصيرة',
    longBreak: 'استراحة طويلة',
    start: 'بدء',
    pause: 'إيقاف',
    reset: 'إعادة تعيين',
    sessions: 'جلسات',
    customize: 'تخصيص',
    workMin: 'عمل (دقيقة)',
    breakMin: 'استراحة (دقيقة)',
    longBreakMin: 'استراحة طويلة (دقيقة)',
  },
};

type Phase = 'work' | 'shortBreak' | 'longBreak';

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
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.value = 880;
      osc2.type = 'sine';
      gain2.gain.value = 0.3;
      osc2.start();
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc2.stop(ctx.currentTime + 0.5);
    }, 300);
  } catch {
    // Audio not available
  }
}

export default function PomodoroTimer({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);

  const [phase, setPhase] = useState<Phase>('work');
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);
  const accumulatedRef = useRef(0);

  // Refs for latest values inside interval
  const phaseRef = useRef<Phase>(phase);
  const workDurationRef = useRef(workDuration);
  const breakDurationRef = useRef(breakDuration);
  const longBreakDurationRef = useRef(longBreakDuration);
  const sessionsRef = useRef(sessions);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { workDurationRef.current = workDuration; }, [workDuration]);
  useEffect(() => { breakDurationRef.current = breakDuration; }, [breakDuration]);
  useEffect(() => { longBreakDurationRef.current = longBreakDuration; }, [longBreakDuration]);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);

  const getPhaseDuration = (p: Phase) => {
    switch (p) {
      case 'work': return workDuration * 60;
      case 'shortBreak': return breakDuration * 60;
      case 'longBreak': return longBreakDuration * 60;
    }
  };

  const totalSec = getPhaseDuration(phase);
  const progressPct = totalSec > 0 ? ((totalSec - remaining) / totalSec) * 100 : 0;

  const formatTime = (sec: number) => {
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
    setRemaining(getPhaseDuration(phase));
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000);
      const newRemaining = accumulatedRef.current - elapsed;

      if (newRemaining <= 0) {
        playBeep();

        const currentPhase = phaseRef.current;
        const currentWork = workDurationRef.current;
        const currentBreak = breakDurationRef.current;
        const currentLongBreak = longBreakDurationRef.current;
        const currentSessions = sessionsRef.current;

        if (currentPhase === 'work') {
          const newSessions = currentSessions + 1;
          setSessions(newSessions);

          if (newSessions % 4 === 0) {
            setPhase('longBreak');
            setRemaining(currentLongBreak * 60);
          } else {
            setPhase('shortBreak');
            setRemaining(currentBreak * 60);
          }
        } else {
          setPhase('work');
          setRemaining(currentWork * 60);
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
      case 'work': return t.work;
      case 'shortBreak': return t.shortBreak;
      case 'longBreak': return t.longBreak;
    }
  };

  const phaseColor = () => {
    switch (phase) {
      case 'work': return 'text-rose-500';
      case 'shortBreak': return 'text-emerald-500';
      case 'longBreak': return 'text-sky-500';
    }
  };

  const phaseRingColor = () => {
    switch (phase) {
      case 'work': return 'stroke-rose-500';
      case 'shortBreak': return 'stroke-emerald-500';
      case 'longBreak': return 'stroke-sky-500';
    }
  };

  const phaseIcon = () => {
    switch (phase) {
      case 'work': return <BookOpen className="size-5" />;
      case 'shortBreak': return <Coffee className="size-5" />;
      case 'longBreak': return <Coffee className="size-5" />;
    }
  };

  // SVG circular progress
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Timer className="size-5" />
            {t.title}
          </CardTitle>
          <Button variant="outline" size="icon" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="size-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Settings */}
          {showSettings && (
            <Card className="bg-muted/30">
              <CardContent className="pt-4 space-y-3">
                <h3 className="text-sm font-medium">{t.customize}</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{t.workMin}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      value={workDuration}
                      onChange={(e) => {
                        const v = Math.max(1, parseInt(e.target.value) || 1);
                        setWorkDuration(v);
                        if (phase === 'work' && !running) setRemaining(v * 60);
                      }}
                      className="tool-input text-center font-mono h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t.breakMin}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      value={breakDuration}
                      onChange={(e) => {
                        const v = Math.max(1, parseInt(e.target.value) || 1);
                        setBreakDuration(v);
                        if (phase === 'shortBreak' && !running) setRemaining(v * 60);
                      }}
                      className="tool-input text-center font-mono h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{t.longBreakMin}</Label>
                    <Input
                      type="number"
                      min={1}
                      max={60}
                      value={longBreakDuration}
                      onChange={(e) => {
                        const v = Math.max(1, parseInt(e.target.value) || 1);
                        setLongBreakDuration(v);
                        if (phase === 'longBreak' && !running) setRemaining(v * 60);
                      }}
                      className="tool-input text-center font-mono h-8"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Circular Timer */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative size-56 sm:size-64">
              <svg className="size-full -rotate-90" viewBox="0 0 200 200">
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  className="stroke-muted"
                  strokeWidth="8"
                />
                <circle
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  className={phaseRingColor()}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`flex items-center gap-1.5 ${phaseColor()} mb-1`}>
                  {phaseIcon()}
                  <span className="font-medium text-sm">{phaseLabel()}</span>
                </div>
                <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-foreground">
                  {formatTime(remaining)}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {!running ? (
                <Button onClick={start} size="lg" className="tool-action-btn gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Play className="size-5" />
                  {t.start}
                </Button>
              ) : (
                <Button onClick={pause} size="lg" variant="destructive" className="gap-2">
                  <Pause className="size-5" />
                  {t.pause}
                </Button>
              )}
              <Button onClick={reset} size="lg" variant="outline" className="gap-2">
                <RotateCcw className="size-5" />
                {t.reset}
              </Button>
            </div>

            {/* Session dots */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{t.sessions}:</span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`size-3 rounded-full transition-colors ${
                      i < sessions % 4 ? 'bg-rose-500' : 'bg-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold">{sessions}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

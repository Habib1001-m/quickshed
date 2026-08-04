'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Flame, Target, CheckCircle2 } from 'lucide-react';
import { normalizeHabits, safeJsonParse, type Habit } from '@/lib/storage-shapes';

const labels = {
  en: {
    title: 'Habit Tracker',
    addHabit: 'Add Habit',
    habitName: 'Habit name',
    frequency: 'Frequency',
    daily: 'Daily',
    weekly: 'Weekly',
    today: 'Today',
    streak: 'Streak',
    last7Days: 'Last 7 Days',
    delete: 'Delete',
    noHabits: 'Add a habit to start tracking',
    days: 'd',
  },
  ar: {
    title: 'متتبع العادات',
    addHabit: 'إضافة عادة',
    habitName: 'اسم العادة',
    frequency: 'التكرار',
    daily: 'يومياً',
    weekly: 'أسبوعياً',
    today: 'اليوم',
    streak: 'سلسلة',
    last7Days: 'آخر 7 أيام',
    delete: 'حذف',
    noHabits: 'أضف عادة لبدء التتبع',
    days: 'ي',
  },
};

const STORAGE_KEY = 'quickshed-habits';

// F2: never trust the parsed shape. Validate each habit so a malformed value
// (non-array root, missing/non-array completedDates, wrong frequency, or
// non-object entries) can never reach completedDates.includes / streak logic.
// The window guard keeps the reader client-safe even though tools are lazy-
// loaded with ssr:false.
function loadHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  try {
    return normalizeHabits(safeJsonParse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return [];
  }
}

function saveHabits(habits: Habit[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  } catch {
    // localStorage not available or quota exceeded — keep in-memory state
  }
}

function getDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getStreak(habit: Habit): number {
  const dates = new Set(habit.completedDates);
  let streak = 0;
  const today = new Date();

  if (habit.frequency === 'daily') {
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (dates.has(getDateStr(d))) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
  } else {
    let weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    for (let i = 0; i < 52; i++) {
      const wStart = new Date(weekStart);
      wStart.setDate(wStart.getDate() - i * 7);
      const wEnd = new Date(wStart);
      wEnd.setDate(wEnd.getDate() + 6);
      let found = false;
      for (const ds of dates) {
        const d = new Date(ds);
        if (d >= wStart && d <= wEnd) { found = true; break; }
      }
      if (found) streak++;
      else if (i > 0) break;
    }
  }

  return streak;
}

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDateStr(d));
  }
  return days;
}

const DAY_LABELS_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_LABELS_AR = ['أ', 'ث', 'ث', 'ر', 'خ', 'ج', 'س'];

export default function HabitTracker({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [habits, setHabits] = useState<Habit[]>(loadHabits);
  const [newName, setNewName] = useState('');
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  const todayStr = useMemo(() => getDateStr(new Date()), []);
  const last7Days = useMemo(() => getLast7Days(), []);

  const addHabit = () => {
    if (!newName.trim()) return;
    const habit: Habit = {
      id: Math.random().toString(36).substring(2, 10),
      name: newName.trim(),
      frequency: newFreq,
      completedDates: [],
    };
    setHabits((prev) => [...prev, habit]);
    setNewName('');
  };

  const toggleToday = (habitId: string) => {
    setHabits((prev) => prev.map((h) => {
      if (h.id !== habitId) return h;
      const completed = h.completedDates.includes(todayStr);
      return {
        ...h,
        completedDates: completed
          ? h.completedDates.filter((d) => d !== todayStr)
          : [...h.completedDates, todayStr],
      };
    }));
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const dayLabels = isRTL ? DAY_LABELS_AR : DAY_LABELS_EN;

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <Target className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={t.habitName}
              className="tool-input flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            />
            <Select value={newFreq} onValueChange={(v) => setNewFreq(v as 'daily' | 'weekly')}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">{t.daily}</SelectItem>
                <SelectItem value="weekly">{t.weekly}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addHabit} disabled={!newName.trim()} className="tool-action-btn gap-2">
              <Plus className="size-4" />
              {t.addHabit}
            </Button>
          </div>
        </CardContent>
      </Card>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="size-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">{t.noHabits}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const isTodayDone = habit.completedDates.includes(todayStr);
            const streak = getStreak(habit);
            const completedSet = new Set(habit.completedDates);

            return (
              <Card key={habit.id}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleToday(habit.id)}
                      className={`size-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isTodayDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-muted-foreground/30 hover:border-emerald-500'
                      }`}
                    >
                      {isTodayDone && <CheckCircle2 className="size-4" />}
                    </button>
                    <span className="flex-1 font-medium text-sm">{habit.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {habit.frequency === 'daily' ? t.daily : t.weekly}
                    </Badge>
                    {streak > 0 && (
                      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 gap-1 text-xs">
                        <Flame className="size-3" />
                        {streak}{t.days}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive"
                      onClick={() => deleteHabit(habit.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>

                  {/* 7-day calendar */}
                  <div className="flex gap-1.5">
                    {last7Days.map((dayStr) => {
                      const done = completedSet.has(dayStr);
                      const dayOfWeek = new Date(dayStr + 'T00:00:00').getDay();
                      return (
                        <div key={dayStr} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-[9px] text-muted-foreground">{dayLabels[dayOfWeek]}</span>
                          <div
                            className={`size-6 rounded-full flex items-center justify-center text-[9px] font-medium transition-colors ${
                              done
                                ? 'bg-emerald-500 text-white'
                                : dayStr === todayStr
                                ? 'bg-primary/20 text-primary border border-primary/40'
                                : 'bg-muted'
                            }`}
                          >
                            {new Date(dayStr + 'T00:00:00').getDate()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

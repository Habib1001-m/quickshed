'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutGrid, Plus, Trash2, ArrowRight } from 'lucide-react';

const labels = {
  en: {
    title: 'Priority Matrix',
    addTask: 'Add Task',
    taskName: 'Task name',
    quadrant: 'Quadrant',
    q1: 'Urgent & Important',
    q1sub: 'Do First',
    q2: 'Not Urgent & Important',
    q2sub: 'Schedule',
    q3: 'Urgent & Not Important',
    q3sub: 'Delegate',
    q4: 'Not Urgent & Not Important',
    q4sub: 'Eliminate',
    move: 'Move to',
    delete: 'Delete',
    empty: 'No tasks yet',
  },
  ar: {
    title: 'مصفوفة الأولويات',
    addTask: 'إضافة مهمة',
    taskName: 'اسم المهمة',
    quadrant: 'الربع',
    q1: 'مهم وعاجل',
    q1sub: 'نفذ أولاً',
    q2: 'مهم وغير عاجل',
    q2sub: 'جدول',
    q3: 'عاجل وغير مهم',
    q3sub: 'فوض',
    q4: 'غير مهم وغير عاجل',
    q4sub: 'استبعد',
    move: 'انقل إلى',
    delete: 'حذف',
    empty: 'لا توجد مهام بعد',
  },
};

type Quadrant = 'q1' | 'q2' | 'q3' | 'q4';

interface Task {
  id: string;
  title: string;
  quadrant: Quadrant;
}

const QUADRANT_COLORS: Record<Quadrant, string> = {
  q1: 'border-red-400 bg-red-50 dark:bg-red-950/30',
  q2: 'border-sky-400 bg-sky-50 dark:bg-sky-950/30',
  q3: 'border-amber-400 bg-amber-50 dark:bg-amber-950/30',
  q4: 'border-zinc-400 bg-zinc-50 dark:bg-zinc-950/30',
};

const QUADRANT_LABEL_COLORS: Record<Quadrant, string> = {
  q1: 'text-red-700 dark:text-red-400',
  q2: 'text-sky-700 dark:text-sky-400',
  q3: 'text-amber-700 dark:text-amber-400',
  q4: 'text-zinc-700 dark:text-zinc-400',
};

export default function PriorityMatrix({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newQuadrant, setNewQuadrant] = useState<Quadrant>('q1');

  const addTask = useCallback(() => {
    if (!newTitle.trim()) return;
    setTasks((prev) => [...prev, {
      id: Math.random().toString(36).substring(2, 10),
      title: newTitle.trim(),
      quadrant: newQuadrant,
    }]);
    setNewTitle('');
  }, [newTitle, newQuadrant]);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const moveTask = useCallback((id: string, quadrant: Quadrant) => {
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, quadrant } : t));
  }, []);

  const quadrantInfo: { key: Quadrant; label: string; sub: string }[] = [
    { key: 'q1', label: t.q1, sub: t.q1sub },
    { key: 'q2', label: t.q2, sub: t.q2sub },
    { key: 'q3', label: t.q3, sub: t.q3sub },
    { key: 'q4', label: t.q4, sub: t.q4sub },
  ];

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <LayoutGrid className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t.taskName}
              className="tool-input flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
            />
            <Select value={newQuadrant} onValueChange={(v) => setNewQuadrant(v as Quadrant)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {quadrantInfo.map((q) => (
                  <SelectItem key={q.key} value={q.key}>{q.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addTask} disabled={!newTitle.trim()} className="tool-action-btn gap-2">
              <Plus className="size-4" />
              {t.addTask}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Matrix */}
        <div className="tool-output grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quadrantInfo.map((q) => {
          const qTasks = tasks.filter((task) => task.quadrant === q.key);
          return (
            <Card key={q.key} className={`border-2 ${QUADRANT_COLORS[q.key]}`}>
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm ${QUADRANT_LABEL_COLORS[q.key]}`}>
                  {q.label}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{q.sub}</p>
              </CardHeader>
              <CardContent>
                {qTasks.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">{t.empty}</p>
                ) : (
                  <div className="space-y-2">
                    {qTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start gap-2 rounded-md border bg-background/60 p-2 text-sm"
                      >
                        <span className="flex-1 break-all">{task.title}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <Select
                            value={task.quadrant}
                            onValueChange={(v) => moveTask(task.id, v as Quadrant)}
                          >
                            <SelectTrigger className="h-7 w-7 p-0 border-none">
                              <ArrowRight className="size-3.5 text-muted-foreground" />
                            </SelectTrigger>
                            <SelectContent>
                              {quadrantInfo.filter((qi) => qi.key !== task.quadrant).map((qi) => (
                                <SelectItem key={qi.key} value={qi.key}>{qi.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 text-destructive hover:text-destructive"
                            onClick={() => deleteTask(task.id)}
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Axis labels */}
      <div className="flex justify-center gap-4 text-xs text-muted-foreground">
        <span>↕ {isRTL ? 'عاجل / غير عاجل' : 'Urgent / Not Urgent'}</span>
        <span>↔ {isRTL ? 'مهم / غير مهم' : 'Important / Not Important'}</span>
      </div>
    </div>
  );
}

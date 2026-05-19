'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, Plus, Trash2 } from 'lucide-react';

interface Assignment {
  id: string;
  name: string;
  grade: number;
  weight: number;
}

function toLetter(average: number): string {
  if (average >= 97) return 'A+';
  if (average >= 93) return 'A';
  if (average >= 90) return 'A-';
  if (average >= 87) return 'B+';
  if (average >= 83) return 'B';
  if (average >= 80) return 'B-';
  if (average >= 77) return 'C+';
  if (average >= 73) return 'C';
  if (average >= 70) return 'C-';
  if (average >= 67) return 'D+';
  if (average >= 63) return 'D';
  if (average >= 60) return 'D-';
  return 'F';
}

function letterColor(letter: string): string {
  if (letter.startsWith('A')) return 'text-emerald-600';
  if (letter.startsWith('B')) return 'text-sky-600';
  if (letter.startsWith('C')) return 'text-amber-600';
  if (letter.startsWith('D')) return 'text-orange-600';
  return 'text-destructive';
}

export default function GradeCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';

  const [assignments, setAssignments] = useState<Assignment[]>([
    { id: '1', name: isAr ? 'واجب 1' : 'Assignment 1', grade: 85, weight: 20 },
    { id: '2', name: isAr ? 'واجب 2' : 'Assignment 2', grade: 92, weight: 30 },
    { id: '3', name: isAr ? 'اختبار' : 'Midterm', grade: 78, weight: 50 },
  ]);

  const addAssignment = () => {
    setAssignments((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', grade: 0, weight: 0 },
    ]);
  };

  const removeAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const updateAssignment = (id: string, field: keyof Assignment, value: string | number) => {
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const totalWeight = assignments.reduce((sum, a) => sum + a.weight, 0);
  const weightedSum = assignments.reduce((sum, a) => sum + a.grade * a.weight, 0);
  const average = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const letter = toLetter(average);

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <Calculator className="size-5 text-amber-500" />
        <h2 className="tool-section-title text-lg font-semibold">
          {isAr ? 'حاسبة الدرجات' : 'Grade Calculator'}
        </h2>
      </div>

      {/* Result */}
      <Card className="tool-output border-amber-200 dark:border-amber-900">
        <CardContent className="pt-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-xs text-muted-foreground">
              {isAr ? 'المتوسط المرجح' : 'Weighted Average'}
            </div>
            <div className="text-3xl font-bold">{average.toFixed(1)}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">
              {isAr ? 'التقدير' : 'Letter Grade'}
            </div>
            <div className={`text-3xl font-bold ${letterColor(letter)}`}>{letter}</div>
          </div>
          <Badge variant={totalWeight === 100 ? 'default' : 'destructive'} className="text-xs">
            {isAr ? 'الوزن' : 'Weight'}: {totalWeight}%
            {totalWeight !== 100 && ` (${isAr ? 'يجب أن يكون 100%' : 'should be 100%'})`}
          </Badge>
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {isAr ? 'المهام' : 'Assignments'}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addAssignment} className="gap-1">
              <Plus className="size-3.5" />
              {isAr ? 'إضافة' : 'Add'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {assignments.map((a) => (
            <div key={a.id} className="flex items-center gap-2">
              <Input
                value={a.name}
                onChange={(e) => updateAssignment(a.id, 'name', e.target.value)}
                placeholder={isAr ? 'اسم المهمة' : 'Assignment name'}
                className="tool-input flex-1 text-sm h-8"
              />
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={a.grade}
                  onChange={(e) => updateAssignment(a.id, 'grade', parseFloat(e.target.value) || 0)}
                  className="tool-input w-20 text-center font-mono h-8"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={a.weight}
                  onChange={(e) => updateAssignment(a.id, 'weight', parseFloat(e.target.value) || 0)}
                  className="tool-input w-16 text-center font-mono h-8"
                />
                <span className="text-xs text-muted-foreground">
                  {isAr ? 'وزن' : 'w%'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive size-7 shrink-0"
                onClick={() => removeAssignment(a.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
          {assignments.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              {isAr ? 'أضف مهام لحساب المتوسط' : 'Add assignments to calculate average'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

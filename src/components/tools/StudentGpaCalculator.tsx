'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

const GRADES = Object.keys(GRADE_POINTS);

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: number;
}

interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export default function StudentGpaCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';

  const [semesters, setSemesters] = useState<Semester[]>([
    {
      id: '1',
      name: isAr ? 'الفصل 1' : 'Semester 1',
      courses: [
        { id: 'c1', name: '', grade: 'A', credits: 3 },
        { id: 'c2', name: '', grade: 'B+', credits: 3 },
      ],
    },
  ]);

  const addSemester = () => {
    setSemesters((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `${isAr ? 'الفصل' : 'Semester'} ${prev.length + 1}`,
        courses: [{ id: Date.now().toString() + 'c', name: '', grade: 'A', credits: 3 }],
      },
    ]);
  };

  const removeSemester = (id: string) => {
    setSemesters((prev) => prev.filter((s) => s.id !== id));
  };

  const addCourse = (semId: string) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semId
          ? {
              ...s,
              courses: [
                ...s.courses,
                { id: Date.now().toString(), name: '', grade: 'A', credits: 3 },
              ],
            }
          : s
      )
    );
  };

  const removeCourse = (semId: string, courseId: string) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semId
          ? { ...s, courses: s.courses.filter((c) => c.id !== courseId) }
          : s
      )
    );
  };

  const updateCourse = (semId: string, courseId: string, field: keyof Course, value: string | number) => {
    setSemesters((prev) =>
      prev.map((s) =>
        s.id === semId
          ? {
              ...s,
              courses: s.courses.map((c) =>
                c.id === courseId ? { ...c, [field]: value } : c
              ),
            }
          : s
      )
    );
  };

  const calcSemGPA = (sem: Semester) => {
    let totalPoints = 0;
    let totalCredits = 0;
    for (const c of sem.courses) {
      const pts = GRADE_POINTS[c.grade] ?? 0;
      totalPoints += pts * c.credits;
      totalCredits += c.credits;
    }
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const calcCumulative = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    for (const sem of semesters) {
      for (const c of sem.courses) {
        const pts = GRADE_POINTS[c.grade] ?? 0;
        totalPoints += pts * c.credits;
        totalCredits += c.credits;
      }
    }
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const cumGPA = calcCumulative();

  const gpaColor = (gpa: number) => {
    if (gpa >= 3.7) return 'text-emerald-600';
    if (gpa >= 3.0) return 'text-sky-600';
    if (gpa >= 2.0) return 'text-amber-600';
    return 'text-destructive';
  };

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <GraduationCap className="size-5 text-amber-500" />
        <h2 className="tool-section-title text-lg font-semibold">
          {isAr ? 'حاسبة المعدل التراكمي' : 'GPA Calculator'}
        </h2>
      </div>

      {/* Cumulative GPA */}
      <Card className="tool-output border-amber-200 dark:border-amber-900">
        <CardContent className="pt-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">
              {isAr ? 'المعدل التراكمي' : 'Cumulative GPA'}
            </div>
            <div className={`text-3xl font-bold ${gpaColor(cumGPA)}`}>
              {cumGPA.toFixed(2)}
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {semesters.reduce((sum, s) => sum + s.courses.length, 0)} {isAr ? 'مواد' : 'courses'}
          </Badge>
        </CardContent>
      </Card>

      {/* Semesters */}
      {semesters.map((sem, si) => {
        const semGPA = calcSemGPA(sem);
        return (
          <Card key={sem.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{sem.name}</CardTitle>
                  <Badge variant="outline" className={`text-xs font-mono ${gpaColor(semGPA)}`}>
                    GPA: {semGPA.toFixed(2)}
                  </Badge>
                </div>
                {semesters.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive size-7"
                    onClick={() => removeSemester(sem.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {sem.courses.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <Input
                    value={c.name}
                    onChange={(e) => updateCourse(sem.id, c.id, 'name', e.target.value)}
                    placeholder={isAr ? 'اسم المادة' : 'Course name'}
                    className="tool-input flex-1 text-sm h-8"
                  />
                  <Select
                    value={c.grade}
                    onValueChange={(v) => updateCourse(sem.id, c.id, 'grade', v)}
                  >
                    <SelectTrigger className="w-20 h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADES.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={c.credits}
                    onChange={(e) => updateCourse(sem.id, c.id, 'credits', parseInt(e.target.value) || 0)}
                    className="tool-input w-16 text-center font-mono h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive size-7 shrink-0"
                    onClick={() => removeCourse(sem.id, c.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => addCourse(sem.id)} className="gap-1">
                <Plus className="size-3.5" />
                {isAr ? 'إضافة مادة' : 'Add Course'}
              </Button>
            </CardContent>
          </Card>
        );
      })}

      <Button onClick={addSemester} variant="outline" className="gap-2 w-full">
        <Plus className="size-4" />
        {isAr ? 'إضافة فصل' : 'Add Semester'}
      </Button>
    </div>
  );
}

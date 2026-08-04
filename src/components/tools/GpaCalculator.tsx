'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GraduationCap } from 'lucide-react';

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: string;
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'F': 0.0,
};

export default function GpaCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: '', grade: '', credits: '3' },
  ]);

  const labels = isRTL
    ? {
        title: 'حاسبة المعدل التراكمي',
        courseName: 'اسم المادة',
        grade: 'الدرجة',
        credits: 'الساعات',
        addCourse: 'إضافة مادة',
        removeCourse: 'حذف',
        cumulativeGpa: 'المعدل التراكمي',
        totalCredits: 'إجمالي الساعات',
        totalPoints: 'إجمالي النقاط',
        courses: 'المواد',
        selectGrade: 'اختر الدرجة',
        gpaScale: 'مقياس 4.0',
        noValidCourses: 'أدخل مواد صالحة لحساب المعدل',
      }
    : {
        title: 'GPA Calculator',
        courseName: 'Course Name',
        grade: 'Grade',
        credits: 'Credits',
        addCourse: 'Add Course',
        removeCourse: 'Remove',
        cumulativeGpa: 'Cumulative GPA',
        totalCredits: 'Total Credits',
        totalPoints: 'Total Points',
        courses: 'Courses',
        selectGrade: 'Select Grade',
        gpaScale: '4.0 Scale',
        noValidCourses: 'Enter valid courses to calculate GPA',
      };

  const addCourse = () => {
    setCourses([...courses, { id: Date.now().toString(), name: '', grade: '', credits: '3' }]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter((c) => c.id !== id));
    }
  };

  const updateCourse = (id: string, field: keyof Course, value: string) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const result = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    let validCourses = 0;

    for (const course of courses) {
      const credits = parseFloat(course.credits);
      const gradePoint = GRADE_POINTS[course.grade];
      if (!isNaN(credits) && credits > 0 && gradePoint !== undefined) {
        totalPoints += gradePoint * credits;
        totalCredits += credits;
        validCourses++;
      }
    }

    if (totalCredits === 0) return null;

    return {
      gpa: totalPoints / totalCredits,
      totalCredits,
      totalPoints,
      validCourses,
    };
  }, [courses]);

  const getGpaColor = (gpa: number) => {
    if (gpa >= 3.5) return 'text-emerald-600 dark:text-emerald-400';
    if (gpa >= 3.0) return 'text-sky-600 dark:text-sky-400';
    if (gpa >= 2.5) return 'text-amber-600 dark:text-amber-400';
    if (gpa >= 2.0) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGpaBarWidth = (gpa: number) => Math.min((gpa / 4.0) * 100, 100);

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <CardTitle className="tool-section-title flex items-center gap-2">
            <GraduationCap className="size-5" />
            {labels.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-3 text-sm font-medium text-muted-foreground">
              <div className="col-span-4">{labels.courseName}</div>
              <div className="col-span-3">{labels.grade}</div>
              <div className="col-span-3">{labels.credits}</div>
              <div className="col-span-2"></div>
            </div>

            {/* Courses */}
            {courses.map((course) => (
              <div key={course.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-4">
                  <Input
                    placeholder={labels.courseName}
                    value={course.name}
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                    className="tool-input"
                  />
                </div>
                <div className="sm:col-span-3">
                  <Select
                    value={course.grade}
                    onValueChange={(value) => updateCourse(course.id, 'grade', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={labels.selectGrade} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(GRADE_POINTS).map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade} ({GRADE_POINTS[grade].toFixed(1)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-3">
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    placeholder={labels.credits}
                    value={course.credits}
                    onChange={(e) => updateCourse(course.id, 'credits', e.target.value)}
                    className="tool-input"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCourse(course.id)}
                    disabled={courses.length <= 1}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button onClick={addCourse} variant="outline" className="w-full">
              <Plus className="size-4 mr-2" />
              {labels.addCourse}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result ? (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="text-emerald-700 dark:text-emerald-400">{labels.cumulativeGpa}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className={`text-5xl font-bold ${getGpaColor(result.gpa)}`}>
                {result.gpa.toFixed(2)}
              </div>
              <p className="text-muted-foreground text-sm mt-1">{labels.gpaScale}</p>
            </div>

            {/* GPA Bar */}
            <div className="w-full bg-muted rounded-full h-4 mb-6 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 via-sky-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${getGpaBarWidth(result.gpa)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">{result.validCourses}</div>
                <p className="text-sm text-muted-foreground">{labels.courses}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{result.totalCredits}</div>
                <p className="text-sm text-muted-foreground">{labels.totalCredits}</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{result.totalPoints.toFixed(1)}</div>
                <p className="text-sm text-muted-foreground">{labels.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">{labels.noValidCourses}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

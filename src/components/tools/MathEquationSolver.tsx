'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sigma, Calculator } from 'lucide-react';

interface Step {
  description: string;
  descriptionAr: string;
  expression: string;
  result: string;
}

function safeEval(expr: string): number | null {
  try {
    // Sanitize: only allow numbers, operators, parentheses, decimal points, spaces
    const sanitized = expr.replace(/\s/g, '');
    if (!/^[0-9+\-*/().^√eE]+$/.test(sanitized)) return null;
    if (/[a-df-zA-DF-Z]/.test(sanitized)) return null; // reject letters except e/E

    // Replace √ with Math.sqrt
    let jsExpr = sanitized
      .replace(/√\(/g, 'Math.sqrt(')
      .replace(/\^/g, '**');

    // Handle implicit sqrt: √9 → Math.sqrt(9)
    jsExpr = jsExpr.replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');

    // Use Function constructor for safe-ish eval
    const fn = new Function(`"use strict"; return (${jsExpr});`);
    const result = fn();
    if (typeof result === 'number' && isFinite(result)) return result;
    return null;
  } catch {
    return null;
  }
}

function generateSteps(expr: string): { steps: Step[]; finalResult: number | null } {
  const steps: Step[] = [];
  let current = expr.trim();

  // Step 1: Show original
  steps.push({
    description: 'Original expression',
    descriptionAr: 'التعبير الأصلي',
    expression: current,
    result: '',
  });

  // Step 2: Handle square roots
  if (current.includes('√')) {
    const simplified = current
      .replace(/√\(([^)]+)\)/g, (_, inner) => {
        const v = safeEval(inner);
        return v !== null ? `√(${inner})=${Math.sqrt(v).toFixed(4)}` : `√(${inner})`;
      })
      .replace(/√(\d+(\.\d+)?)/g, (match, num) => {
        const v = Math.sqrt(parseFloat(num));
        return v.toFixed(4);
      });
    steps.push({
      description: 'Evaluate square roots',
      descriptionAr: 'حساب الجذور التربيعية',
      expression: current,
      result: simplified,
    });
  }

  // Step 3: Handle exponents
  if (current.includes('^')) {
    steps.push({
      description: 'Evaluate exponents',
      descriptionAr: 'حساب الأسس',
      expression: current,
      result: `= ${current.replace(/\^/g, '**')} → evaluated`,
    });
  }

  // Step 4: Handle parentheses
  const parenMatch = current.match(/\([^()]+\)/);
  if (parenMatch) {
    const inner = parenMatch[0].slice(1, -1);
    const v = safeEval(inner);
    if (v !== null) {
      steps.push({
        description: `Evaluate ${parenMatch[0]}`,
        descriptionAr: `حساب ${parenMatch[0]}`,
        expression: inner,
        result: `= ${v}`,
      });
      current = current.replace(parenMatch[0], `(${v})`);
    }
  }

  // Final result
  const finalResult = safeEval(expr);
  steps.push({
    description: 'Final result',
    descriptionAr: 'النتيجة النهائية',
    expression: expr,
    result: finalResult !== null ? `= ${finalResult}` : '= Error',
  });

  return { steps, finalResult };
}

const EXAMPLES = [
  { label: '2 + 3 * 4', labelAr: '2 + 3 × 4', expr: '2 + 3 * 4' },
  { label: '(5 + 3) ^ 2', labelAr: '(5 + 3) ^ 2', expr: '(5 + 3) ^ 2' },
  { label: '√(144)', labelAr: '√(144)', expr: '√(144)' },
  { label: '(10 - 4) / 2 + 3', labelAr: '(10 - 4) / 2 + 3', expr: '(10 - 4) / 2 + 3' },
  { label: '2 ^ 3 + √(16)', labelAr: '2 ^ 3 + √(16)', expr: '2 ^ 3 + √(16)' },
];

export default function MathEquationSolver({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<{ steps: Step[]; finalResult: number | null } | null>(null);

  const solve = () => {
    if (!expression.trim()) return;
    const r = generateSteps(expression);
    setResult(r);
  };

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <Sigma className="size-5 text-amber-500" />
        <h2 className="tool-section-title text-lg font-semibold">
          {isAr ? 'حل المعادلات الرياضية' : 'Math Equation Solver'}
        </h2>
      </div>

      {/* Input */}
      <Card className="tool-wrapper-card">
        <CardContent className="pt-4 space-y-3">
          <div className="flex gap-2">
            <Input
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder={isAr ? 'أدخل التعبير الرياضي...' : 'Enter math expression...'}
              className="tool-input font-mono text-lg"
              onKeyDown={(e) => e.key === 'Enter' && solve()}
            />
            <Button onClick={solve} className="tool-action-btn gap-2 bg-amber-600 hover:bg-amber-700 shrink-0">
              <Calculator className="size-4" />
              {isAr ? 'حل' : 'Solve'}
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            {isAr
              ? 'يدعم: + - * / ^ √() أقواس'
              : 'Supports: + - * / ^ √() parentheses'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <Button
                key={ex.expr}
                variant="outline"
                size="sm"
                className="font-mono text-xs"
                onClick={() => {
                  setExpression(ex.expr);
                  const r = generateSteps(ex.expr);
                  setResult(r);
                }}
              >
                {isAr ? ex.labelAr : ex.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      {result && (
        <Card className="tool-output">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {isAr ? 'خطوات الحل' : 'Step-by-Step Solution'}
              </CardTitle>
              {result.finalResult !== null && (
                <Badge className="text-sm font-mono bg-amber-600">
                  = {result.finalResult}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.steps.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2 rounded-md bg-muted/30"
                >
                  <span className="text-xs font-mono text-muted-foreground w-6 shrink-0 pt-0.5">
                    {i + 1}.
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">
                      {isAr ? step.descriptionAr : step.description}
                    </div>
                    {step.result ? (
                      <div className="text-sm font-mono">
                        <span className="text-muted-foreground">{step.expression}</span>
                        <span className="mx-1">→</span>
                        <span className="font-medium">{step.result}</span>
                      </div>
                    ) : (
                      <div className="text-sm font-mono font-medium">{step.expression}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

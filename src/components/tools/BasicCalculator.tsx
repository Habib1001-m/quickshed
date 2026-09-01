'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Delete, ArrowLeft } from 'lucide-react';

export default function BasicCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);
  const [error, setError] = useState(false);

  const labels = isRTL
    ? {
        title: 'آلة حاسبة أساسية',
        input: 'الإدخال',
        output: 'النتيجة',
        clear: 'مسح',
        error: 'خطأ',
        divByZero: 'لا يمكن القسمة على صفر',
      }
    : {
        title: 'Basic Calculator',
        input: 'Input',
        output: 'Result',
        clear: 'Clear',
        error: 'Error',
        divByZero: 'Cannot divide by zero',
      };

  const handleNumber = (num: string) => {
    if (error) {
      setError(false);
      setDisplay(num);
      return;
    }
    if (resetNext) {
      setDisplay(num);
      setResetNext(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (error) {
      setError(false);
      setDisplay('0.');
      return;
    }
    if (resetNext) {
      setDisplay('0.');
      setResetNext(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    if (error) return;
    const current = parseFloat(display);
    if (previousValue !== null && operation && !resetNext) {
      const result = calculate(previousValue, current, operation);
      if (result === null) {
        setError(true);
        setDisplay(labels.divByZero);
        setPreviousValue(null);
        setOperation(null);
        return;
      }
      setPreviousValue(result);
      setDisplay(String(result));
    } else {
      setPreviousValue(current);
    }
    setOperation(op);
    setResetNext(true);
  };

  const calculate = (a: number, b: number, op: string): number | null => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷':
        if (b === 0) return null;
        return a / b;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (error) return;
    if (previousValue !== null && operation) {
      const current = parseFloat(display);
      const result = calculate(previousValue, current, operation);
      if (result === null) {
        setError(true);
        setDisplay(labels.divByZero);
        setPreviousValue(null);
        setOperation(null);
        return;
      }
      setDisplay(String(parseFloat(result.toFixed(10))));
      setPreviousValue(null);
      setOperation(null);
      setResetNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setResetNext(false);
    setError(false);
  };

  const handleBackspace = () => {
    if (error) {
      handleClear();
      return;
    }
    if (resetNext) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  const handlePercent = () => {
    if (error) return;
    const current = parseFloat(display);
    if (previousValue !== null) {
      const result = previousValue * (current / 100);
      setDisplay(String(parseFloat(result.toFixed(10))));
    } else {
      setDisplay(String(parseFloat((current / 100).toFixed(10))));
    }
    setResetNext(true);
  };

  const handleNegate = () => {
    if (error) return;
    if (display !== '0') {
      setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
    }
  };

  const formatDisplay = (value: string) => {
    if (error) return value;
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (value.endsWith('.')) return value;
    if (value.includes('.') && value.endsWith('0') && !resetNext) return value;
    return num.toLocaleString(isRTL ? 'ar-SA' : 'en-US', { maximumFractionDigits: 10 });
  };

  const opSymbol = operation
    ? isRTL
      ? { '+': '+', '-': '−', '×': '×', '÷': '÷' }[operation] || operation
      : operation
    : '';

  const buttonClass = (type: 'number' | 'operator' | 'function') => {
    switch (type) {
      case 'operator':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800';
      case 'function':
        return 'bg-muted hover:bg-muted/80 text-foreground';
      case 'number':
      default:
        return 'bg-background hover:bg-muted text-foreground border border-border';
    }
  };

  const buttons = [
    { label: isRTL ? 'مسح' : 'C', action: handleClear, type: 'function' as const },
    { label: '±', action: handleNegate, type: 'function' as const },
    { label: '%', action: handlePercent, type: 'function' as const },
    { label: '÷', action: () => handleOperation('÷'), type: 'operator' as const },

    { label: '7', action: () => handleNumber('7'), type: 'number' as const },
    { label: '8', action: () => handleNumber('8'), type: 'number' as const },
    { label: '9', action: () => handleNumber('9'), type: 'number' as const },
    { label: '×', action: () => handleOperation('×'), type: 'operator' as const },

    { label: '4', action: () => handleNumber('4'), type: 'number' as const },
    { label: '5', action: () => handleNumber('5'), type: 'number' as const },
    { label: '6', action: () => handleNumber('6'), type: 'number' as const },
    { label: '-', action: () => handleOperation('-'), type: 'operator' as const },

    { label: '1', action: () => handleNumber('1'), type: 'number' as const },
    { label: '2', action: () => handleNumber('2'), type: 'number' as const },
    { label: '3', action: () => handleNumber('3'), type: 'number' as const },
    { label: '+', action: () => handleOperation('+'), type: 'operator' as const },

    { label: '0', action: () => handleNumber('0'), type: 'number' as const, span: 1 },
    { label: '.', action: handleDecimal, type: 'number' as const },
    { label: '=', action: handleEquals, type: 'operator' as const },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{labels.title}</span>
            {opSymbol && (
              <span className="text-sm font-normal text-emerald-600 dark:text-emerald-400">
                {previousValue !== null ? `${previousValue} ${opSymbol}` : ''}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Display */}
          <div className="mb-4 rounded-xl bg-muted/50 p-4 border border-border">
            <div className="text-right text-3xl sm:text-4xl font-mono font-bold text-foreground truncate">
              {formatDisplay(display)}
            </div>
          </div>

          {/* Backspace Button */}
          <div className="flex justify-end mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackspace}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className={`size-4 ${isRTL ? 'rotate-180' : ''}`} />
              <Delete className="size-4 ml-1" />
            </Button>
          </div>

          {/* Button Grid */}
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((btn, i) => (
              <Button
                key={i}
                variant="ghost"
                className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${buttonClass(btn.type)}`}
                onClick={btn.action}
              >
                {btn.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

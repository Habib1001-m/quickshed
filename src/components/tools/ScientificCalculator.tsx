'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Delete, Calculator } from 'lucide-react';

export default function ScientificCalculator({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);
  const [error, setError] = useState(false);
  const [isScientific, setIsScientific] = useState(true);
  const [isRadians, setIsRadians] = useState(true);
  const [memory, setMemory] = useState<number>(0);

  const labels = isRTL
    ? {
        title: 'آلة حاسبة علمية',
        scientific: 'علمي',
        basic: 'أساسي',
        rad: 'راديان',
        deg: 'درجات',
        error: 'خطأ',
        divByZero: 'لا يمكن القسمة على صفر',
        invalidInput: 'إدخال غير صالح',
      }
    : {
        title: 'Scientific Calculator',
        scientific: 'Scientific',
        basic: 'Basic',
        rad: 'RAD',
        deg: 'DEG',
        error: 'Error',
        divByZero: 'Cannot divide by zero',
        invalidInput: 'Invalid input',
      };

  const getCurrentValue = useCallback((): number => {
    return parseFloat(display) || 0;
  }, [display]);

  const toAngle = useCallback((val: number): number => {
    return isRadians ? val : (val * Math.PI) / 180;
  }, [isRadians]);

  const fromAngle = useCallback((val: number): number => {
    return isRadians ? val : (val * 180) / Math.PI;
  }, [isRadians]);

  const factorial = (n: number): number => {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
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

  const calculate = (a: number, b: number, op: string): number | null => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷':
        if (b === 0) return null;
        return a / b;
      case '^': return Math.pow(a, b);
      default: return b;
    }
  };

  const handleOperation = (op: string) => {
    if (error) return;
    const current = getCurrentValue();
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
      setDisplay(String(parseFloat(result.toFixed(10))));
    } else {
      setPreviousValue(current);
    }
    setOperation(op);
    setResetNext(true);
  };

  const handleEquals = () => {
    if (error) return;
    if (previousValue !== null && operation) {
      const current = getCurrentValue();
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
    if (error) { handleClear(); return; }
    if (resetNext) return;
    setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
  };

  const handleScientific = (fn: string) => {
    if (error) return;
    const val = getCurrentValue();
    let result: number;

    switch (fn) {
      case 'sin': result = Math.sin(toAngle(val)); break;
      case 'cos': result = Math.cos(toAngle(val)); break;
      case 'tan':
        if (Math.abs(Math.cos(toAngle(val))) < 1e-10) {
          setError(true); setDisplay(labels.invalidInput); return;
        }
        result = Math.tan(toAngle(val)); break;
      case 'asin':
        if (val < -1 || val > 1) { setError(true); setDisplay(labels.invalidInput); return; }
        result = fromAngle(Math.asin(val)); break;
      case 'acos':
        if (val < -1 || val > 1) { setError(true); setDisplay(labels.invalidInput); return; }
        result = fromAngle(Math.acos(val)); break;
      case 'atan': result = fromAngle(Math.atan(val)); break;
      case 'log':
        if (val <= 0) { setError(true); setDisplay(labels.invalidInput); return; }
        result = Math.log10(val); break;
      case 'ln':
        if (val <= 0) { setError(true); setDisplay(labels.invalidInput); return; }
        result = Math.log(val); break;
      case 'sqrt':
        if (val < 0) { setError(true); setDisplay(labels.invalidInput); return; }
        result = Math.sqrt(val); break;
      case 'x2': result = val * val; break;
      case 'x3': result = val * val * val; break;
      case '1/x':
        if (val === 0) { setError(true); setDisplay(labels.divByZero); return; }
        result = 1 / val; break;
      case '!':
        if (val < 0 || val !== Math.floor(val)) { setError(true); setDisplay(labels.invalidInput); return; }
        result = factorial(val); break;
      case '10x': result = Math.pow(10, val); break;
      case 'ex': result = Math.exp(val); break;
      case 'abs': result = Math.abs(val); break;
      case 'pi': result = Math.PI; break;
      case 'e': result = Math.E; break;
      default: return;
    }

    if (!isFinite(result)) {
      setError(true);
      setDisplay(labels.invalidInput);
      return;
    }

    setDisplay(String(parseFloat(result.toFixed(10))));
    setResetNext(true);
  };

  const handleNegate = () => {
    if (error) return;
    if (display !== '0') {
      setDisplay(display.startsWith('-') ? display.slice(1) : '-' + display);
    }
  };

  const handlePercent = () => {
    if (error) return;
    const current = getCurrentValue();
    if (previousValue !== null) {
      const result = previousValue * (current / 100);
      setDisplay(String(parseFloat(result.toFixed(10))));
    } else {
      setDisplay(String(parseFloat((current / 100).toFixed(10))));
    }
    setResetNext(true);
  };

  const handleMC = () => setMemory(0);
  const handleMR = () => { setDisplay(String(memory)); setResetNext(true); };
  const handleMS = () => setMemory(getCurrentValue());
  const handleMPlus = () => setMemory(memory + getCurrentValue());
  const handleMMinus = () => setMemory(memory - getCurrentValue());

  const formatDisplay = (value: string) => {
    if (error) return value;
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (value.endsWith('.')) return value;
    if (value.includes('.') && value.endsWith('0') && !resetNext) return value;
    return num.toLocaleString(isRTL ? 'ar-SA' : 'en-US', { maximumFractionDigits: 10 });
  };

  const opSymbol = operation || '';

  const btnClass = (type: 'number' | 'operator' | 'function' | 'scientific') => {
    switch (type) {
      case 'operator':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-700 dark:hover:bg-emerald-800';
      case 'function':
        return 'bg-muted hover:bg-muted/80 text-foreground';
      case 'scientific':
        return 'bg-violet-100 hover:bg-violet-200 text-violet-800 dark:bg-violet-900/40 dark:hover:bg-violet-900/60 dark:text-violet-300';
      case 'number':
      default:
        return 'bg-background hover:bg-muted text-foreground border border-border';
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader>
          <div className="flex flex-col gap-3">
            <CardTitle className="tool-section-title flex items-center justify-between">
              <span className="flex items-center gap-2"><Calculator className="size-5" />{labels.title}</span>
              {opSymbol && previousValue !== null && (
                <span className="text-sm font-normal text-emerald-600 dark:text-emerald-400">
                  {previousValue} {opSymbol}
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-4 flex-wrap">
              {/* Mode Toggle */}
              <div className="flex items-center gap-2">
                <Label className="text-xs">{labels.basic}</Label>
                <Switch checked={isScientific} onCheckedChange={setIsScientific} />
                <Label className="text-xs">{labels.scientific}</Label>
              </div>
              {/* Angle Mode */}
              {isScientific && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs">{labels.deg}</Label>
                  <Switch checked={isRadians} onCheckedChange={setIsRadians} />
                  <Label className="text-xs">{labels.rad}</Label>
                </div>
              )}
              {/* Memory indicator */}
              {memory !== 0 && (
                <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5">M</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Display */}
          <div className="tool-output mb-4 rounded-xl bg-muted/50 p-4 border border-border">
            <div className="text-right text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-foreground truncate">
              {formatDisplay(display)}
            </div>
          </div>

          {/* Backspace */}
          <div className="flex justify-end mb-3">
            <Button variant="ghost" size="sm" onClick={handleBackspace} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className={`size-4 ${isRTL ? 'rotate-180' : ''}`} />
              <Delete className="size-4 ml-1" />
            </Button>
          </div>

          {/* Scientific Buttons */}
          {isScientific && (
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {/* Row 1 */}
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('sin')}>sin</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('cos')}>cos</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('tan')}>tan</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('log')}>log</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('ln')}>ln</Button>

              {/* Row 2 */}
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('asin')}>sin⁻¹</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('acos')}>cos⁻¹</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('atan')}>tan⁻¹</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('10x')}>10ˣ</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('ex')}>eˣ</Button>

              {/* Row 3 */}
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('sqrt')}>√x</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('x2')}>x²</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('x3')}>x³</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleOperation('^')}>xʸ</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('!')}>n!</Button>

              {/* Row 4 */}
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('1/x')}>1/x</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('abs')}>|x|</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('pi')}>π</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('scientific')}`} onClick={() => handleScientific('e')}>e</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('function')}`} onClick={handleNegate}>±</Button>

              {/* Row 5 - Memory */}
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('function')}`} onClick={handleMC}>MC</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('function')}`} onClick={handleMR}>MR</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('function')}`} onClick={handleMS}>MS</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('function')}`} onClick={handleMPlus}>M+</Button>
              <Button variant="ghost" className={`h-9 text-xs font-medium rounded-lg ${btnClass('function')}`} onClick={handleMMinus}>M−</Button>
            </div>
          )}

          {/* Main Calculator Buttons */}
          <div className="grid grid-cols-4 gap-2">
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('function')}`} onClick={handleClear}>C</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('function')}`} onClick={handlePercent}>%</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('function')}`} onClick={handleBackspace}>⌫</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('operator')}`} onClick={() => handleOperation('÷')}>÷</Button>

            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('number')}`} onClick={() => handleNumber('7')}>7</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('number')}`} onClick={() => handleNumber('8')}>8</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('number')}`} onClick={() => handleNumber('9')}>9</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('operator')}`} onClick={() => handleOperation('×')}>×</Button>

            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('number')}`} onClick={() => handleNumber('4')}>4</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('number')}`} onClick={() => handleNumber('5')}>5</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('number')}`} onClick={() => handleNumber('6')}>6</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('operator')}`} onClick={() => handleOperation('-')}>−</Button>

            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('number')}`} onClick={() => handleNumber('1')}>1</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('number')}`} onClick={() => handleNumber('2')}>2</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('number')}`} onClick={() => handleNumber('3')}>3</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('operator')}`} onClick={() => handleOperation('+')}>+</Button>

            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('number')}`} onClick={() => handleNumber('0')}>0</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('number')}`} onClick={handleDecimal}>.</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('operator')}`} onClick={handleEquals}>=</Button>
            <Button variant="ghost" className={`h-12 sm:h-14 text-lg font-semibold rounded-xl ${btnClass('function')}`} onClick={() => handleScientific('sqrt')}>√</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

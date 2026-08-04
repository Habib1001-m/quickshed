'use client';

import React from 'react';
import nextDynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import type { ToolComponentName } from '@/lib/tool-component-registry';

// Tool component props type
interface ToolProps {
  locale: 'ar' | 'en';
}

function ToolLoadingFallback() {
  return React.createElement(
    'div',
    { className: 'space-y-4', 'aria-busy': 'true' },
    React.createElement('div', { className: 'tool-skeleton h-12 w-full' }),
    React.createElement('div', { className: 'tool-skeleton h-12 w-full' }),
    React.createElement('div', { className: 'tool-skeleton h-32 w-full' }),
    React.createElement('div', { className: 'tool-skeleton h-10 w-32' }),
  );
}

type ToolLoader = () => Promise<{ default: ComponentType<ToolProps> }>;

function dynamic(loader: ToolLoader) {
  return nextDynamic(loader, {
    ssr: false,
    loading: () => React.createElement(ToolLoadingFallback),
  });
}

// Lazy-loaded tool components map
// Using dynamic imports to avoid loading all tools at once
const toolComponentMap: Record<ToolComponentName, ComponentType<ToolProps>> = {
  // Calculators
  BasicCalculator: dynamic(() => import('./BasicCalculator')),
  ScientificCalculator: dynamic(() => import('./ScientificCalculator')),
  PercentageCalculator: dynamic(() => import('./PercentageCalculator')),
  AgeCalculator: dynamic(() => import('./AgeCalculator')),
  GpaCalculator: dynamic(() => import('./GpaCalculator')),
  BmiCalculator: dynamic(() => import('./BmiCalculator')),
  LoanCalculator: dynamic(() => import('./LoanCalculator')),
  TipCalculator: dynamic(() => import('./TipCalculator')),
  DiscountCalculator: dynamic(() => import('./DiscountCalculator')),
  FuelCostCalculator: dynamic(() => import('./FuelCostCalculator')),
  CurrencyConverterCalculator: dynamic(() => import('./CurrencyConverterCalculator')),
  CompoundInterestCalculator: dynamic(() => import('./CompoundInterestCalculator')),
  SalaryCalculator: dynamic(() => import('./SalaryCalculator')),
  // Time Tools
  WorldClock: dynamic(() => import('./WorldClock')),
  Stopwatch: dynamic(() => import('./Stopwatch')),
  CountdownTimer: dynamic(() => import('./CountdownTimer')),
  DateDifference: dynamic(() => import('./DateDifference')),
  TimeZoneConverter: dynamic(() => import('./TimeZoneConverter')),
  AlarmCreator: dynamic(() => import('./AlarmCreator')),
  DateAdder: dynamic(() => import('./DateAdder')),
  UnixTimestampConverter: dynamic(() => import('./UnixTimestampConverter')),
  WorkHoursCalculator: dynamic(() => import('./WorkHoursCalculator')),
  // Text Tools
  WordCounter: dynamic(() => import('./WordCounter')),
  CaseConverter: dynamic(() => import('./CaseConverter')),
  TextReverser: dynamic(() => import('./TextReverser')),
  RemoveDuplicates: dynamic(() => import('./RemoveDuplicates')),
  TextDiff: dynamic(() => import('./TextDiff')),
  MarkdownToHtml: dynamic(() => import('./MarkdownToHtml')),
  LoremIpsumGenerator: dynamic(() => import('./LoremIpsumGenerator')),
  CursiveTextGenerator: dynamic(() => import('./CursiveTextGenerator')),
  TextEncoderDecoder: dynamic(() => import('./TextEncoderDecoder')),
  SlugGenerator: dynamic(() => import('./SlugGenerator')),
  // Converters
  UnitConverter: dynamic(() => import('./UnitConverter')),
  TemperatureConverter: dynamic(() => import('./TemperatureConverter')),
  SpeedConverter: dynamic(() => import('./SpeedConverter')),
  DataSizeConverter: dynamic(() => import('./DataSizeConverter')),
  NumberBaseConverter: dynamic(() => import('./NumberBaseConverter')),
  ColorConverter: dynamic(() => import('./ColorConverter')),
  LengthConverter: dynamic(() => import('./LengthConverter')),
  // Student Tools
  CitationGenerator: dynamic(() => import('./CitationGenerator')),
  EssayWordCounter: dynamic(() => import('./EssayWordCounter')),
  FlashcardMaker: dynamic(() => import('./FlashcardMaker')),
  StudentGpaCalculator: dynamic(() => import('./StudentGpaCalculator')),
  GradeCalculator: dynamic(() => import('./GradeCalculator')),
  ReadingTimeCalculator: dynamic(() => import('./ReadingTimeCalculator')),
  PlagiarismChecker: dynamic(() => import('./PlagiarismChecker')),
  MathEquationSolver: dynamic(() => import('./MathEquationSolver')),
  NoteOrganizer: dynamic(() => import('./NoteOrganizer')),
  StudyTimer: dynamic(() => import('./StudyTimer')),
  // Developer Tools
  JsonFormatter: dynamic(() => import('./JsonFormatter')),
  HtmlBeautifier: dynamic(() => import('./HtmlBeautifier')),
  JwtDecoder: dynamic(() => import('./JwtDecoder')),
  CronExpressionParser: dynamic(() => import('./CronExpressionParser')),
  SqlFormatter: dynamic(() => import('./SqlFormatter')),
  Base64Encoder: dynamic(() => import('./Base64Encoder')),
  UuidGeneratorDev: dynamic(() => import('./UuidGeneratorDev')),
  HashGenerator: dynamic(() => import('./HashGenerator')),
  // Utility Tools
  PasswordGenerator: dynamic(() => import('./PasswordGenerator')),
  QrCodeGenerator: dynamic(() => import('./QrCodeGenerator')),
  ColorPicker: dynamic(() => import('./ColorPicker')),
  UuidGenerator: dynamic(() => import('./UuidGenerator')),
  RandomNumberGenerator: dynamic(() => import('./RandomNumberGenerator')),
  UrlShortener: dynamic(() => import('./UrlShortener')),
  BarcodeGenerator: dynamic(() => import('./BarcodeGenerator')),
  EmojiPicker: dynamic(() => import('./EmojiPicker')),
  WhitespaceRemover: dynamic(() => import('./WhitespaceRemover')),
  LineSorter: dynamic(() => import('./LineSorter')),
  TextToBinary: dynamic(() => import('./TextToBinary')),
  MorseCodeTranslator: dynamic(() => import('./MorseCodeTranslator')),
  PriorityMatrix: dynamic(() => import('./PriorityMatrix')),
  HabitTracker: dynamic(() => import('./HabitTracker')),
  PomodoroTimer: dynamic(() => import('./PomodoroTimer')),
  // SEO Tools
  MetaTagGenerator: dynamic(() => import('./MetaTagGenerator')),
  SerpSimulator: dynamic(() => import('./SerpSimulator')),
  KeywordDensityChecker: dynamic(() => import('./KeywordDensityChecker')),
  RobotsTxtGenerator: dynamic(() => import('./RobotsTxtGenerator')),
  OpenGraphDebugger: dynamic(() => import('./OpenGraphDebugger')),
  // Image Tools
  ImageResizer: dynamic(() => import('./ImageResizer')),
  ImageCropper: dynamic(() => import('./ImageCropper')),
  ImageFormatConverter: dynamic(() => import('./ImageFormatConverter')),
  ColorPaletteExtractor: dynamic(() => import('./ColorPaletteExtractor')),
  // Security Tools
  SslChecker: dynamic(() => import('./SslChecker')),
  PasswordStrengthAnalyzer: dynamic(() => import('./PasswordStrengthAnalyzer')),
  RandomPasswordGenerator: dynamic(() => import('./RandomPasswordGenerator')),
  UrlEncoderDecoder: dynamic(() => import('./UrlEncoderDecoder')),
  // PDF Tools
  PdfToText: dynamic(() => import('./PdfToText')),
  PdfMerger: dynamic(() => import('./PdfMerger')),
  PdfPageRemover: dynamic(() => import('./PdfPageRemover')),
  PdfRotate: dynamic(() => import('./PdfRotate')),
  PdfWatermark: dynamic(() => import('./PdfWatermark')),
};

export function getToolComponent(componentName: string): ComponentType<ToolProps> | null {
  if (!Object.prototype.hasOwnProperty.call(toolComponentMap, componentName)) return null;
  return toolComponentMap[componentName as ToolComponentName] || null;
}

// ToolRenderer: renders a tool component by name using React.createElement
// This avoids the ESLint "static-components" rule that fires when using JSX
// with a dynamically-resolved component type
export function ToolRenderer({ componentName, locale }: { componentName: string; locale: 'ar' | 'en' }) {
  const Component = getToolComponent(componentName);
  if (!Component) return null;
  return React.createElement(Component, { locale });
}

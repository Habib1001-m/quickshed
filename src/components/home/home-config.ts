import {
  Database, FileLock2, Gift, Globe, Heart, LayoutGrid, Lock, Shield,
  ShieldAlert, UserX, Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Privacy } from '@/lib/tool-utils';
import type { Variants } from 'framer-motion';

export const FEATURES = [
  {
    icon: Shield,
    titleKey: 'home.privacyFirst',
    descKey: 'home.privacyFirstDesc',
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
    ring: 'ring-emerald-200 dark:ring-emerald-800',
    gradient: 'from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/10',
    accent: 'emerald',
    number: '01',
  },
  {
    icon: Gift,
    titleKey: 'home.freeForever',
    descKey: 'home.freeForeverDesc',
    color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
    ring: 'ring-sky-200 dark:ring-sky-800',
    gradient: 'from-sky-50 to-sky-100/50 dark:from-sky-950/30 dark:to-sky-900/10',
    accent: 'sky',
    number: '02',
  },
  {
    icon: Globe,
    titleKey: 'home.bilingual',
    descKey: 'home.bilingualDesc',
    color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    ring: 'ring-violet-200 dark:ring-violet-800',
    gradient: 'from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/10',
    accent: 'violet',
    number: '03',
  },
  {
    icon: UserX,
    titleKey: 'home.noAccount',
    descKey: 'home.noAccountDesc',
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400',
    ring: 'ring-orange-200 dark:ring-orange-800',
    gradient: 'from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/10',
    accent: 'orange',
    number: '04',
  },
] as const;

export const ACCENT_BORDER_COLORS: Record<string, string> = {
  emerald: '#10b981',
  sky: '#0ea5e9',
  violet: '#8b5cf6',
  orange: '#f97316',
};

export const STATS_CONFIG = [
  { key: 'home.statsTools', icon: Wrench, type: 'tools' as const },
  { key: 'home.statsCategories', icon: LayoutGrid, type: 'categories' as const },
  { key: 'home.statsFree', icon: Heart, type: 'free' as const },
  { key: 'home.statsPrivacy', icon: Lock, type: 'privacy' as const },
];

export const CATEGORY_EXAMPLES: Record<string, { en: string; ar: string }[]> = {
  calculators: [
    { en: 'Basic Calculator', ar: 'آلة حاسبة أساسية' },
    { en: 'Loan Calculator', ar: 'حاسبة القروض' },
    { en: 'BMI Calculator', ar: 'حاسبة مؤشر كتلة الجسم' },
  ],
  'time-tools': [
    { en: 'Stopwatch', ar: 'ساعة إيقاف' },
    { en: 'Countdown Timer', ar: 'مؤقت تنازلي' },
    { en: 'World Clock', ar: 'ساعة عالمية' },
  ],
  'text-tools': [
    { en: 'Word Counter', ar: 'عداد الكلمات' },
    { en: 'Case Converter', ar: 'محول الحالة' },
    { en: 'Slug Generator', ar: 'مولد الرابط الودي' },
  ],
  converters: [
    { en: 'Unit Converter', ar: 'محول الوحدات' },
    { en: 'Temperature Converter', ar: 'محول درجة الحرارة' },
    { en: 'Color Converter', ar: 'محول الألوان' },
  ],
  'student-tools': [
    { en: 'GPA Calculator', ar: 'حاسبة المعدل التراكمي' },
    { en: 'Flashcard Maker', ar: 'صانع البطاقات التعليمية' },
    { en: 'Citation Generator', ar: 'مولد الاستشهادات' },
  ],
  'pdf-tools': [
    { en: 'PDF Merger', ar: 'دمج ملفات PDF' },
    { en: 'PDF to Text', ar: 'PDF إلى نص' },
  ],
  'utility-tools': [
    { en: 'Password Generator', ar: 'مولد كلمات المرور' },
    { en: 'QR Code Generator', ar: 'مولد رمز QR' },
    { en: 'Color Picker', ar: 'منتقي الألوان' },
  ],
  'seo-tools': [
    { en: 'Meta Tag Generator', ar: 'مولد العلامات الوصفية' },
    { en: 'SERP Simulator', ar: 'محاكي نتائج البحث' },
  ],
  'developer-tools': [
    { en: 'JSON Formatter', ar: 'منسق JSON' },
    { en: 'JWT Decoder', ar: 'فاك تشفير JWT' },
    { en: 'Base64 Encoder', ar: 'مشفر Base64' },
  ],
  'image-tools': [
    { en: 'Image Resizer', ar: 'تغيير حجم الصور' },
    { en: 'Image Cropper', ar: 'قص الصور' },
  ],
  'security-tools': [
    { en: 'SSL Checker', ar: 'مدقق SSL' },
    { en: 'Password Strength', ar: 'قوة كلمة المرور' },
  ],
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

export function spotlightPrivacyLabelKey(privacy: Privacy): string {
  switch (privacy) {
    case 'local':
      return 'home.localProcessing';
    case 'file-only':
      return 'home.processesFileLocally';
    case 'storage':
      return 'home.savedOnDevice';
    case 'api':
      return 'home.requiresConnection';
  }
}

export const SPOTLIGHT_PRIVACY_ICON: Record<Privacy, { Icon: LucideIcon; color: string }> = {
  local: { Icon: Shield, color: 'text-emerald-500' },
  'file-only': { Icon: FileLock2, color: 'text-sky-500' },
  storage: { Icon: Database, color: 'text-violet-500' },
  api: { Icon: ShieldAlert, color: 'text-amber-500' },
};

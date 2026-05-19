'use client';

import React from 'react';
import {
  Calculator, FlaskConical, Percent, CalendarDays, GraduationCap,
  Activity, Banknote, Receipt, Tag, Fuel, ArrowLeftRight, TrendingUp,
  Wallet, Clock, Timer, Hourglass, CalendarRange, Globe, Bell,
  CalendarPlus, Hash, Briefcase, Type, CaseSensitive, ArrowRightLeft,
  ListMinus, GitCompare, FileCode, AlignLeft, PenTool, Lock, Link,
  Ruler, Thermometer, Gauge, HardDrive, Binary, Palette, MoveHorizontal,
  BookOpen, FileText, Layers, ClipboardList, Award, BookOpenCheck,
  SearchCheck, Variable, StickyNote, Clock4, FileSearch, Merge, Scissors,
  RotateCw, Droplets, KeyRound, QrCode, Pipette, Fingerprint, Dice5,
  Link2, Barcode, Smile, ScissorsLineDashed, ArrowDownUp, Radio,
  LayoutGrid, CheckCircle, TimerReset, Code2, Search, BarChart3, Bot,
  Share2, Braces, FileCode2, Key, Database, ShieldCheck, Move, Crop,
  Image, Shield, ShieldAlert, Wrench, Code, Circle,
} from 'lucide-react';

type IconComponent = React.ComponentType<React.ComponentProps<typeof Circle>>;

/**
 * Map of icon name strings to Lucide React icon components.
 * Covers all icons used across the 90+ tools and 11 categories.
 */
const iconMap: Record<string, IconComponent> = {
  Calculator,
  FlaskConical,
  Percent,
  CalendarDays,
  GraduationCap,
  Activity,
  Banknote,
  Receipt,
  Tag,
  Fuel,
  ArrowLeftRight,
  TrendingUp,
  Wallet,
  Clock,
  Timer,
  Hourglass,
  CalendarRange,
  Globe,
  Bell,
  CalendarPlus,
  Hash,
  Briefcase,
  Type,
  CaseSensitive,
  ArrowRightLeft,
  ListMinus,
  GitCompare,
  FileCode,
  AlignLeft,
  PenTool,
  Lock,
  Link,
  Ruler,
  Thermometer,
  Gauge,
  HardDrive,
  Binary,
  Palette,
  MoveHorizontal,
  BookOpen,
  FileText,
  Layers,
  ClipboardList,
  Award,
  BookOpenCheck,
  SearchCheck,
  Variable,
  StickyNote,
  Clock4,
  FileSearch,
  Merge,
  Scissors,
  RotateCw,
  Droplets,
  KeyRound,
  QrCode,
  Pipette,
  Fingerprint,
  Dice5,
  Link2,
  Barcode,
  Smile,
  ScissorsLineDashed,
  ArrowDownUp,
  Radio,
  LayoutGrid,
  CheckCircle,
  Tomato: TimerReset,
  Code2,
  Search,
  BarChart3,
  Bot,
  Share2,
  Braces,
  FileCode2,
  Key,
  Database,
  ShieldCheck,
  Move,
  Crop,
  Image,
  Shield,
  ShieldAlert,
  Wrench,
  Code,
  // Alias: LinkIcon is used in some tool definitions but maps to Link2 in lucide
  LinkIcon: Link2,
};

/**
 * Get an icon component by its name string.
 * Returns null if the icon name is not found in the map.
 */
export function getIcon(name: string): IconComponent | null {
  return iconMap[name] || null;
}

/**
 * Dynamic icon component that renders a Lucide icon by name.
 * Returns null if the icon name is not found.
 * Uses React.createElement to avoid the "components created during render" lint rule.
 */
export function DynamicIcon({
  name,
  ...props
}: { name: string } & Omit<React.ComponentProps<typeof Circle>, 'ref'>) {
  const IconComponent = getIcon(name);
  if (!IconComponent) return null;
  return React.createElement(IconComponent, props);
}

'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SmilePlus, Search, Check } from 'lucide-react';
import { copyTextToClipboard } from '@/lib/clipboard';
import { normalizeEmojiRecent, safeJsonParse, EMOJI_RECENT_CAP } from '@/lib/storage-shapes';

const labels = {
  en: {
    title: 'Emoji Picker',
    search: 'Search emojis...',
    copied: 'Copied!',
    recentlyUsed: 'Recently Used',
    noRecent: 'No recently used emojis',
    noResults: 'No emojis found',
  },
  ar: {
    title: 'منتقي الرموز التعبيرية',
    search: 'البحث عن رموز...',
    copied: 'تم النسخ!',
    recentlyUsed: 'المستخدمة مؤخراً',
    noRecent: 'لا توجد رموز مستخدمة مؤخراً',
    noResults: 'لم يتم العثور على رموز',
  },
};

interface EmojiData {
  emoji: string;
  name: string;
  category: string;
}

const EMOJI_CATEGORIES: Record<string, { name: string; nameAr: string; emojis: EmojiData[] }> = {
  smileys: {
    name: 'Smileys',
    nameAr: 'وجوه',
    emojis: [
      { emoji: '😀', name: 'Grinning Face', category: 'smileys' },
      { emoji: '😃', name: 'Smiling Eyes', category: 'smileys' },
      { emoji: '😄', name: 'Smiling Eyes', category: 'smileys' },
      { emoji: '😁', name: 'Beaming Face', category: 'smileys' },
      { emoji: '😆', name: 'Squinting Face', category: 'smileys' },
      { emoji: '😅', name: 'Sweat Smile', category: 'smileys' },
      { emoji: '🤣', name: 'Rolling Laughing', category: 'smileys' },
      { emoji: '😂', name: 'Joy', category: 'smileys' },
      { emoji: '🙂', name: 'Slight Smile', category: 'smileys' },
      { emoji: '😉', name: 'Wink', category: 'smileys' },
      { emoji: '😊', name: 'Blush', category: 'smileys' },
      { emoji: '😇', name: 'Halo', category: 'smileys' },
      { emoji: '🥰', name: 'Hearts', category: 'smileys' },
      { emoji: '😍', name: 'Heart Eyes', category: 'smileys' },
      { emoji: '🤩', name: 'Star Struck', category: 'smileys' },
      { emoji: '😘', name: 'Kiss', category: 'smileys' },
      { emoji: '😋', name: 'Yum', category: 'smileys' },
      { emoji: '😛', name: 'Tongue', category: 'smileys' },
      { emoji: '🤔', name: 'Thinking', category: 'smileys' },
      { emoji: '🤗', name: 'Hugging', category: 'smileys' },
      { emoji: '🤫', name: 'Shushing', category: 'smileys' },
      { emoji: '🤭', name: 'Hand Over Mouth', category: 'smileys' },
      { emoji: '😐', name: 'Neutral', category: 'smileys' },
      { emoji: '😑', name: 'Expressionless', category: 'smileys' },
      { emoji: '😶', name: 'No Mouth', category: 'smileys' },
      { emoji: '😏', name: 'Smirk', category: 'smileys' },
      { emoji: '😒', name: 'Unamused', category: 'smileys' },
      { emoji: '🙄', name: 'Eye Roll', category: 'smileys' },
      { emoji: '😬', name: 'Grimacing', category: 'smileys' },
      { emoji: '😮‍💨', name: 'Exhale', category: 'smileys' },
      { emoji: '😌', name: 'Relieved', category: 'smileys' },
      { emoji: '😔', name: 'Pensive', category: 'smileys' },
      { emoji: '😪', name: 'Sleepy', category: 'smileys' },
      { emoji: '😴', name: 'Sleeping', category: 'smileys' },
      { emoji: '😷', name: 'Mask', category: 'smileys' },
      { emoji: '🤒', name: 'Thermometer', category: 'smileys' },
      { emoji: '🤕', name: 'Bandage', category: 'smileys' },
      { emoji: '🤢', name: 'Nauseated', category: 'smileys' },
      { emoji: '🤮', name: 'Vomiting', category: 'smileys' },
      { emoji: '🥵', name: 'Hot', category: 'smileys' },
      { emoji: '🥶', name: 'Cold', category: 'smileys' },
      { emoji: '😱', name: 'Screaming', category: 'smileys' },
      { emoji: '😨', name: 'Fearful', category: 'smileys' },
      { emoji: '😰', name: 'Anxious', category: 'smileys' },
      { emoji: '😥', name: 'Sad Relieved', category: 'smileys' },
      { emoji: '😢', name: 'Crying', category: 'smileys' },
      { emoji: '😭', name: 'Sobbing', category: 'smileys' },
      { emoji: '😤', name: 'Huffing', category: 'smileys' },
      { emoji: '😡', name: 'Angry', category: 'smileys' },
      { emoji: '🤬', name: 'Cursing', category: 'smileys' },
      { emoji: '😈', name: 'Devil Smile', category: 'smileys' },
      { emoji: '💀', name: 'Skull', category: 'smileys' },
      { emoji: '☠️', name: 'Skull Crossbones', category: 'smileys' },
      { emoji: '👻', name: 'Ghost', category: 'smileys' },
      { emoji: '👽', name: 'Alien', category: 'smileys' },
      { emoji: '🤖', name: 'Robot', category: 'smileys' },
      { emoji: '🎃', name: 'Jack-o-lantern', category: 'smileys' },
    ],
  },
  animals: {
    name: 'Animals',
    nameAr: 'حيوانات',
    emojis: [
      { emoji: '🐶', name: 'Dog', category: 'animals' },
      { emoji: '🐱', name: 'Cat', category: 'animals' },
      { emoji: '🐭', name: 'Mouse', category: 'animals' },
      { emoji: '🐹', name: 'Hamster', category: 'animals' },
      { emoji: '🐰', name: 'Rabbit', category: 'animals' },
      { emoji: '🦊', name: 'Fox', category: 'animals' },
      { emoji: '🐻', name: 'Bear', category: 'animals' },
      { emoji: '🐼', name: 'Panda', category: 'animals' },
      { emoji: '🐨', name: 'Koala', category: 'animals' },
      { emoji: '🐯', name: 'Tiger', category: 'animals' },
      { emoji: '🦁', name: 'Lion', category: 'animals' },
      { emoji: '🐮', name: 'Cow', category: 'animals' },
      { emoji: '🐷', name: 'Pig', category: 'animals' },
      { emoji: '🐸', name: 'Frog', category: 'animals' },
      { emoji: '🐵', name: 'Monkey', category: 'animals' },
      { emoji: '🐔', name: 'Chicken', category: 'animals' },
      { emoji: '🐧', name: 'Penguin', category: 'animals' },
      { emoji: '🐦', name: 'Bird', category: 'animals' },
      { emoji: '🦅', name: 'Eagle', category: 'animals' },
      { emoji: '🦉', name: 'Owl', category: 'animals' },
      { emoji: '🐍', name: 'Snake', category: 'animals' },
      { emoji: '🐢', name: 'Turtle', category: 'animals' },
      { emoji: '🐠', name: 'Fish', category: 'animals' },
      { emoji: '🐬', name: 'Dolphin', category: 'animals' },
      { emoji: '🐳', name: 'Whale', category: 'animals' },
      { emoji: '🦋', name: 'Butterfly', category: 'animals' },
      { emoji: '🐌', name: 'Snail', category: 'animals' },
      { emoji: '🦄', name: 'Unicorn', category: 'animals' },
      { emoji: '🐝', name: 'Bee', category: 'animals' },
      { emoji: '🐞', name: 'Ladybug', category: 'animals' },
    ],
  },
  food: {
    name: 'Food',
    nameAr: 'طعام',
    emojis: [
      { emoji: '🍎', name: 'Apple', category: 'food' },
      { emoji: '🍊', name: 'Orange', category: 'food' },
      { emoji: '🍋', name: 'Lemon', category: 'food' },
      { emoji: '🍌', name: 'Banana', category: 'food' },
      { emoji: '🍉', name: 'Watermelon', category: 'food' },
      { emoji: '🍇', name: 'Grapes', category: 'food' },
      { emoji: '🍓', name: 'Strawberry', category: 'food' },
      { emoji: '🫐', name: 'Blueberries', category: 'food' },
      { emoji: '🍑', name: 'Peach', category: 'food' },
      { emoji: '🥭', name: 'Mango', category: 'food' },
      { emoji: '🍍', name: 'Pineapple', category: 'food' },
      { emoji: '🥥', name: 'Coconut', category: 'food' },
      { emoji: '🥑', name: 'Avocado', category: 'food' },
      { emoji: '🍆', name: 'Eggplant', category: 'food' },
      { emoji: '🥕', name: 'Carrot', category: 'food' },
      { emoji: '🌽', name: 'Corn', category: 'food' },
      { emoji: '🌶️', name: 'Pepper', category: 'food' },
      { emoji: '🥒', name: 'Cucumber', category: 'food' },
      { emoji: '🍕', name: 'Pizza', category: 'food' },
      { emoji: '🍔', name: 'Burger', category: 'food' },
      { emoji: '🍟', name: 'Fries', category: 'food' },
      { emoji: '🌮', name: 'Taco', category: 'food' },
      { emoji: '🍣', name: 'Sushi', category: 'food' },
      { emoji: '🍜', name: 'Noodles', category: 'food' },
      { emoji: '🍝', name: 'Pasta', category: 'food' },
      { emoji: '🍩', name: 'Donut', category: 'food' },
      { emoji: '🍪', name: 'Cookie', category: 'food' },
      { emoji: '🎂', name: 'Birthday Cake', category: 'food' },
      { emoji: '☕', name: 'Coffee', category: 'food' },
      { emoji: '🍵', name: 'Tea', category: 'food' },
    ],
  },
  travel: {
    name: 'Travel',
    nameAr: 'سفر',
    emojis: [
      { emoji: '🚗', name: 'Car', category: 'travel' },
      { emoji: '🚕', name: 'Taxi', category: 'travel' },
      { emoji: '🚌', name: 'Bus', category: 'travel' },
      { emoji: '🚎', name: 'Trolleybus', category: 'travel' },
      { emoji: '🏎️', name: 'Race Car', category: 'travel' },
      { emoji: '🚓', name: 'Police Car', category: 'travel' },
      { emoji: '🚑', name: 'Ambulance', category: 'travel' },
      { emoji: '🚒', name: 'Fire Truck', category: 'travel' },
      { emoji: '✈️', name: 'Airplane', category: 'travel' },
      { emoji: '🚀', name: 'Rocket', category: 'travel' },
      { emoji: '🚁', name: 'Helicopter', category: 'travel' },
      { emoji: '🛳️', name: 'Ship', category: 'travel' },
      { emoji: '⛵', name: 'Sailboat', category: 'travel' },
      { emoji: '🚲', name: 'Bicycle', category: 'travel' },
      { emoji: '🏍️', name: 'Motorcycle', category: 'travel' },
      { emoji: '🏠', name: 'House', category: 'travel' },
      { emoji: '🏢', name: 'Office', category: 'travel' },
      { emoji: '🏗️', name: 'Construction', category: 'travel' },
      { emoji: '🌍', name: 'Globe', category: 'travel' },
      { emoji: '🏔️', name: 'Mountain', category: 'travel' },
      { emoji: '🏖️', name: 'Beach', category: 'travel' },
      { emoji: '🏜️', name: 'Desert', category: 'travel' },
      { emoji: '🌋', name: 'Volcano', category: 'travel' },
      { emoji: '🏕️', name: 'Camping', category: 'travel' },
      { emoji: '🗼', name: 'Tower', category: 'travel' },
      { emoji: '🗽', name: 'Statue of Liberty', category: 'travel' },
      { emoji: '⛪', name: 'Church', category: 'travel' },
      { emoji: '🕌', name: 'Mosque', category: 'travel' },
      { emoji: '⛩️', name: 'Shinto Shrine', category: 'travel' },
      { emoji: '🕋', name: 'Kaaba', category: 'travel' },
    ],
  },
  activities: {
    name: 'Activities',
    nameAr: 'أنشطة',
    emojis: [
      { emoji: '⚽', name: 'Soccer', category: 'activities' },
      { emoji: '🏀', name: 'Basketball', category: 'activities' },
      { emoji: '🏈', name: 'Football', category: 'activities' },
      { emoji: '⚾', name: 'Baseball', category: 'activities' },
      { emoji: '🎾', name: 'Tennis', category: 'activities' },
      { emoji: '🏐', name: 'Volleyball', category: 'activities' },
      { emoji: '🏓', name: 'Ping Pong', category: 'activities' },
      { emoji: '🏸', name: 'Badminton', category: 'activities' },
      { emoji: '🥊', name: 'Boxing', category: 'activities' },
      { emoji: '🏊', name: 'Swimming', category: 'activities' },
      { emoji: '🏋️', name: 'Weightlifting', category: 'activities' },
      { emoji: '🚴', name: 'Cycling', category: 'activities' },
      { emoji: '🧗', name: 'Climbing', category: 'activities' },
      { emoji: '⛷️', name: 'Skiing', category: 'activities' },
      { emoji: '🏂', name: 'Snowboarding', category: 'activities' },
      { emoji: '🎯', name: 'Bullseye', category: 'activities' },
      { emoji: '🎮', name: 'Game Controller', category: 'activities' },
      { emoji: '🕹️', name: 'Joystick', category: 'activities' },
      { emoji: '🎲', name: 'Dice', category: 'activities' },
      { emoji: '♟️', name: 'Chess Pawn', category: 'activities' },
      { emoji: '🎭', name: 'Theater', category: 'activities' },
      { emoji: '🎨', name: 'Art', category: 'activities' },
      { emoji: '🎬', name: 'Movie', category: 'activities' },
      { emoji: '🎤', name: 'Microphone', category: 'activities' },
      { emoji: '🎧', name: 'Headphones', category: 'activities' },
      { emoji: '🎵', name: 'Music Note', category: 'activities' },
      { emoji: '🎸', name: 'Guitar', category: 'activities' },
      { emoji: '🎹', name: 'Piano', category: 'activities' },
      { emoji: '🥁', name: 'Drum', category: 'activities' },
      { emoji: '🏆', name: 'Trophy', category: 'activities' },
    ],
  },
  objects: {
    name: 'Objects',
    nameAr: 'أشياء',
    emojis: [
      { emoji: '💻', name: 'Laptop', category: 'objects' },
      { emoji: '🖥️', name: 'Desktop', category: 'objects' },
      { emoji: '📱', name: 'Phone', category: 'objects' },
      { emoji: '⌚', name: 'Watch', category: 'objects' },
      { emoji: '📷', name: 'Camera', category: 'objects' },
      { emoji: '📺', name: 'TV', category: 'objects' },
      { emoji: '💡', name: 'Light Bulb', category: 'objects' },
      { emoji: '🔦', name: 'Flashlight', category: 'objects' },
      { emoji: '📖', name: 'Book', category: 'objects' },
      { emoji: '📚', name: 'Books', category: 'objects' },
      { emoji: '✏️', name: 'Pencil', category: 'objects' },
      { emoji: '🖊️', name: 'Pen', category: 'objects' },
      { emoji: '📎', name: 'Paperclip', category: 'objects' },
      { emoji: '📌', name: 'Pushpin', category: 'objects' },
      { emoji: '🔑', name: 'Key', category: 'objects' },
      { emoji: '🔒', name: 'Lock', category: 'objects' },
      { emoji: '🔧', name: 'Wrench', category: 'objects' },
      { emoji: '🔨', name: 'Hammer', category: 'objects' },
      { emoji: '⚙️', name: 'Gear', category: 'objects' },
      { emoji: '🧲', name: 'Magnet', category: 'objects' },
      { emoji: '💰', name: 'Money Bag', category: 'objects' },
      { emoji: '💎', name: 'Gem', category: 'objects' },
      { emoji: '🎁', name: 'Gift', category: 'objects' },
      { emoji: '🧸', name: 'Teddy Bear', category: 'objects' },
      { emoji: '🔋', name: 'Battery', category: 'objects' },
      { emoji: '🧪', name: 'Test Tube', category: 'objects' },
      { emoji: '🔬', name: 'Microscope', category: 'objects' },
      { emoji: '🔭', name: 'Telescope', category: 'objects' },
      { emoji: '💊', name: 'Pill', category: 'objects' },
      { emoji: '🩺', name: 'Stethoscope', category: 'objects' },
    ],
  },
  symbols: {
    name: 'Symbols',
    nameAr: 'رموز',
    emojis: [
      { emoji: '❤️', name: 'Red Heart', category: 'symbols' },
      { emoji: '🧡', name: 'Orange Heart', category: 'symbols' },
      { emoji: '💛', name: 'Yellow Heart', category: 'symbols' },
      { emoji: '💚', name: 'Green Heart', category: 'symbols' },
      { emoji: '💙', name: 'Blue Heart', category: 'symbols' },
      { emoji: '💜', name: 'Purple Heart', category: 'symbols' },
      { emoji: '🖤', name: 'Black Heart', category: 'symbols' },
      { emoji: '🤍', name: 'White Heart', category: 'symbols' },
      { emoji: '💔', name: 'Broken Heart', category: 'symbols' },
      { emoji: '❣️', name: 'Exclamation Heart', category: 'symbols' },
      { emoji: '💕', name: 'Two Hearts', category: 'symbols' },
      { emoji: '💞', name: 'Revolving Hearts', category: 'symbols' },
      { emoji: '💓', name: 'Beating Heart', category: 'symbols' },
      { emoji: '💗', name: 'Growing Heart', category: 'symbols' },
      { emoji: '💖', name: 'Sparkling Heart', category: 'symbols' },
      { emoji: '💘', name: 'Cupid Heart', category: 'symbols' },
      { emoji: '✅', name: 'Check Mark', category: 'symbols' },
      { emoji: '❌', name: 'Cross Mark', category: 'symbols' },
      { emoji: '⭐', name: 'Star', category: 'symbols' },
      { emoji: '🌟', name: 'Glowing Star', category: 'symbols' },
      { emoji: '💫', name: 'Dizzy Star', category: 'symbols' },
      { emoji: '🔥', name: 'Fire', category: 'symbols' },
      { emoji: '💧', name: 'Droplet', category: 'symbols' },
      { emoji: '⚡', name: 'Lightning', category: 'symbols' },
      { emoji: '♻️', name: 'Recycle', category: 'symbols' },
      { emoji: '☮️', name: 'Peace', category: 'symbols' },
      { emoji: '✝️', name: 'Cross', category: 'symbols' },
      { emoji: '☪️', name: 'Star and Crescent', category: 'symbols' },
      { emoji: '🕉️', name: 'Om', category: 'symbols' },
      { emoji: '♾️', name: 'Infinity', category: 'symbols' },
    ],
  },
  flags: {
    name: 'Flags',
    nameAr: 'أعلام',
    emojis: [
      { emoji: '🏁', name: 'Checkered Flag', category: 'flags' },
      { emoji: '🚩', name: 'Triangular Flag', category: 'flags' },
      { emoji: '🏳️', name: 'White Flag', category: 'flags' },
      { emoji: '🏴', name: 'Black Flag', category: 'flags' },
      { emoji: '🇺🇸', name: 'USA', category: 'flags' },
      { emoji: '🇬🇧', name: 'UK', category: 'flags' },
      { emoji: '🇫🇷', name: 'France', category: 'flags' },
      { emoji: '🇩🇪', name: 'Germany', category: 'flags' },
      { emoji: '🇮🇹', name: 'Italy', category: 'flags' },
      { emoji: '🇪🇸', name: 'Spain', category: 'flags' },
      { emoji: '🇵🇹', name: 'Portugal', category: 'flags' },
      { emoji: '🇷🇺', name: 'Russia', category: 'flags' },
      { emoji: '🇨🇳', name: 'China', category: 'flags' },
      { emoji: '🇯🇵', name: 'Japan', category: 'flags' },
      { emoji: '🇰🇷', name: 'South Korea', category: 'flags' },
      { emoji: '🇮🇳', name: 'India', category: 'flags' },
      { emoji: '🇧🇷', name: 'Brazil', category: 'flags' },
      { emoji: '🇲🇽', name: 'Mexico', category: 'flags' },
      { emoji: '🇦🇺', name: 'Australia', category: 'flags' },
      { emoji: '🇨🇦', name: 'Canada', category: 'flags' },
      { emoji: '🇸🇦', name: 'Saudi Arabia', category: 'flags' },
      { emoji: '🇦🇪', name: 'UAE', category: 'flags' },
      { emoji: '🇪🇬', name: 'Egypt', category: 'flags' },
      { emoji: '🇶🇦', name: 'Qatar', category: 'flags' },
      { emoji: '🇰🇼', name: 'Kuwait', category: 'flags' },
      { emoji: '🇧🇭', name: 'Bahrain', category: 'flags' },
      { emoji: '🇴🇲', name: 'Oman', category: 'flags' },
      { emoji: '🇯🇴', name: 'Jordan', category: 'flags' },
      { emoji: '🇱🇧', name: 'Lebanon', category: 'flags' },
      { emoji: '🇮🇶', name: 'Iraq', category: 'flags' },
    ],
  },
};

const STORAGE_KEY = 'quickshed-emoji-recent';

// F2: validate and cap recents so a malformed value (an object, a primitive,
// mixed element types, or an over-cap array) can never reach .slice / array
// operations. Capped to EMOJI_RECENT_CAP to match the writer. The window
// guard keeps the reader client-safe even though tools load with ssr:false.
function loadRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return normalizeEmojiRecent(safeJsonParse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return [];
  }
}

function saveRecent(emojis: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(emojis.slice(0, EMOJI_RECENT_CAP)));
  } catch {
    // localStorage not available — keep in-memory state
  }
}

export default function EmojiPicker({ locale }: { locale: 'ar' | 'en' }) {
  const isRTL = locale === 'ar';
  const t = labels[locale];

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [copiedEmoji, setCopiedEmoji] = useState('');
  const [hoveredEmoji, setHoveredEmoji] = useState('');

  useEffect(() => {
    saveRecent(recent);
  }, [recent]);

  const filteredEmojis = useMemo(() => {
    const cat = EMOJI_CATEGORIES[activeCategory];
    if (!cat) return [];
    if (!search.trim()) return cat.emojis;
    const q = search.toLowerCase();
    return cat.emojis.filter((e) => e.name.toLowerCase().includes(q) || e.emoji.includes(q));
  }, [activeCategory, search]);

  const handleCopy = async (emoji: string) => {
    setCopiedEmoji('');
    if (!(await copyTextToClipboard(emoji))) {
      setCopiedEmoji('');
      return;
    }

    setCopiedEmoji(emoji);
    setRecent((prev) => [emoji, ...prev.filter((e) => e !== emoji)].slice(0, EMOJI_RECENT_CAP));
    setTimeout(() => setCopiedEmoji(''), 2000);
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card className="tool-wrapper-card">
        <CardHeader className="pb-3">
          <CardTitle className="tool-section-title flex items-center gap-2 text-lg">
            <SmilePlus className="size-5" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.search}
              className="tool-input ps-9"
            />
          </div>

          {/* Category tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
            {Object.entries(EMOJI_CATEGORIES).map(([key, cat]) => (
              <Button
                key={key}
                variant={activeCategory === key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveCategory(key)}
                className="shrink-0 text-xs"
              >
                {isRTL ? cat.nameAr : cat.name}
              </Button>
            ))}
          </div>

          {/* Recently used */}
          {recent.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">{t.recentlyUsed}</div>
              <div className="flex flex-wrap gap-1">
                {recent.slice(0, 12).map((emoji, i) => (
                  <button
                    key={`${emoji}-${i}`}
                    onClick={() => handleCopy(emoji)}
                    className="size-9 flex items-center justify-center rounded-md hover:bg-muted text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Emoji grid */}
          <div className="min-h-[200px]">
            {filteredEmojis.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">{t.noResults}</p>
            ) : (
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-0.5">
                {filteredEmojis.map((item) => (
                  <button
                    key={item.emoji}
                    onClick={() => handleCopy(item.emoji)}
                    onMouseEnter={() => setHoveredEmoji(item.emoji)}
                    onMouseLeave={() => setHoveredEmoji('')}
                    className="relative size-10 flex items-center justify-center rounded-md hover:bg-muted text-xl transition-colors"
                    title={item.name}
                  >
                    {item.emoji}
                    {copiedEmoji === item.emoji && (
                      <span className="absolute inset-0 flex items-center justify-center rounded-md bg-emerald-500/20">
                        <Check className="size-3 text-emerald-500" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hovered emoji name */}
          {hoveredEmoji && (
            <div className="text-center text-sm text-muted-foreground">
              {(() => {
                for (const cat of Object.values(EMOJI_CATEGORIES)) {
                  const found = cat.emojis.find((e) => e.emoji === hoveredEmoji);
                  if (found) return found.name;
                }
                return '';
              })()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

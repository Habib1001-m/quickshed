'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StickyNote, Plus, Trash2, Pencil, Search, X } from 'lucide-react';
import { normalizeNotes, safeJsonParse, type Note } from '@/lib/storage-shapes';

const COLORS = [
  { value: 'default', label: 'Default', labelAr: 'افتراضي', bg: 'bg-card', border: 'border-border' },
  { value: 'red', label: 'Red', labelAr: 'أحمر', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900' },
  { value: 'amber', label: 'Amber', labelAr: 'كهرماني', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900' },
  { value: 'emerald', label: 'Green', labelAr: 'أخضر', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-900' },
  { value: 'sky', label: 'Blue', labelAr: 'أزرق', bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-200 dark:border-sky-900' },
  { value: 'violet', label: 'Purple', labelAr: 'بنفسجي', bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-200 dark:border-violet-900' },
  { value: 'pink', label: 'Pink', labelAr: 'وردي', bg: 'bg-pink-50 dark:bg-pink-950/30', border: 'border-pink-200 dark:border-pink-900' },
];

const CATEGORIES = [
  { value: 'general', label: 'General', labelAr: 'عام' },
  { value: 'study', label: 'Study', labelAr: 'دراسة' },
  { value: 'work', label: 'Work', labelAr: 'عمل' },
  { value: 'personal', label: 'Personal', labelAr: 'شخصي' },
  { value: 'ideas', label: 'Ideas', labelAr: 'أفكار' },
];

const STORAGE_KEY = 'quickshed-notes';

// F2: validate each note against the shared shape so a malformed value (a
// non-array root or entries with missing/non-string fields) can never reach
// the renderer. Returns [] for malformed JSON, primitives, and null.
function loadNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    return normalizeNotes(safeJsonParse(localStorage.getItem(STORAGE_KEY)));
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Storage not available
  }
}

export default function NoteOrganizer({ locale }: { locale: 'ar' | 'en' }) {
  const isAr = locale === 'ar';
  // Lazy-initialize from localStorage once on mount (client-only: tools mount
  // with ssr:false and loadNotes guards typeof window). Reading storage during
  // the initial render — instead of a separate load effect — avoids a
  // load/save race where the save effect below would otherwise persist the
  // initial [] over valid data before/around the load (notably under React
  // StrictMode's simulated remount in dev). Mirrors HabitTracker/EmojiPicker.
  const [notes, setNotes] = useState<Note[]>(loadNotes);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [color, setColor] = useState('default');
  const titleRef = useRef<HTMLInputElement>(null);

  // Save to localStorage
  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  const createNote = () => {
    if (!title.trim()) return;
    const note: Note = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      category,
      color,
      updatedAt: Date.now(),
    };
    setNotes((prev) => [note, ...prev]);
    resetForm();
  };

  const updateNote = () => {
    if (!editingNote || !title.trim()) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === editingNote.id
          ? { ...n, title: title.trim(), content: content.trim(), category, color, updatedAt: Date.now() }
          : n
      )
    );
    resetForm();
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingNote?.id === id) resetForm();
  };

  const startEdit = (note: Note) => {
    setEditingNote(note);
    setIsCreating(false);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setColor(note.color);
    titleRef.current?.focus();
  };

  const startCreate = () => {
    setIsCreating(true);
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('general');
    setColor('default');
    titleRef.current?.focus();
  };

  const resetForm = () => {
    setEditingNote(null);
    setIsCreating(false);
    setTitle('');
    setContent('');
    setCategory('general');
    setColor('default');
  };

  const filteredNotes = notes.filter((n) => {
    const matchesCategory = filterCategory === 'all' || n.category === filterCategory;
    const matchesSearch =
      !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getColorClass = (c: string) => {
    const found = COLORS.find((cl) => cl.value === c);
    return found ? `${found.bg} ${found.border}` : 'bg-card border-border';
  };

  const getCategoryLabel = (cat: string) => {
    const found = CATEGORIES.find((c) => c.value === cat);
    return found ? (isAr ? found.labelAr : found.label) : cat;
  };

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="size-5 text-amber-500" />
          <h2 className="tool-section-title text-lg font-semibold">
            {isAr ? 'منظم الملاحظات' : 'Note Organizer'}
          </h2>
        </div>
        <Button onClick={startCreate} size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="size-4" />
          {isAr ? 'جديد' : 'New'}
        </Button>
      </div>

      {/* Edit/Create form */}
      {(isCreating || editingNote) && (
        <Card className="tool-wrapper-card">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {editingNote
                  ? isAr ? 'تعديل ملاحظة' : 'Edit Note'
                  : isAr ? 'ملاحظة جديدة' : 'New Note'}
              </span>
              <Button variant="ghost" size="icon" className="size-7" onClick={resetForm}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? 'العنوان' : 'Title'}</Label>
              <Input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAr ? 'عنوان الملاحظة' : 'Note title'}
                className="tool-input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{isAr ? 'المحتوى' : 'Content'}</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isAr ? 'اكتب ملاحظتك...' : 'Write your note...'}
                className="tool-input min-h-[100px] text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? 'الفئة' : 'Category'}</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {isAr ? c.labelAr : c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{isAr ? 'اللون' : 'Color'}</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {isAr ? c.labelAr : c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={editingNote ? updateNote : createNote}
              className="tool-action-btn gap-2 bg-emerald-600 hover:bg-emerald-700"
              disabled={!title.trim()}
            >
              {editingNote
                ? isAr ? 'تحديث' : 'Update'
                : isAr ? 'إنشاء' : 'Create'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث في الملاحظات...' : 'Search notes...'}
            className="tool-input ps-9 h-9 text-sm"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-28 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isAr ? 'الكل' : 'All'}</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {isAr ? c.labelAr : c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className={`cursor-pointer transition-all hover:shadow-md ${getColorClass(note.color)}`}
              onClick={() => startEdit(note)}
            >
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm line-clamp-1">{note.title}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(note);
                      }}
                    >
                      <Pencil className="size-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
                {note.content && (
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-2">
                    {note.content}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {getCategoryLabel(note.category)}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <StickyNote className="size-8 mx-auto mb-2 opacity-40" />
            <p>{isAr ? 'لا توجد ملاحظات' : 'No notes found'}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

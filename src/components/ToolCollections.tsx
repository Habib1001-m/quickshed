'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, Plus, Trash2, X, Check, ChevronDown,
  ExternalLink, FolderPlus,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { getToolById, localize } from '@/lib/tool-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function ToolCollections() {
  const { t, locale: localeFromI18n } = useI18n();
  const collections = useAppStore((s) => s.collections);
  const createCollection = useAppStore((s) => s.createCollection);
  const deleteCollection = useAppStore((s) => s.deleteCollection);
  const renameCollection = useAppStore((s) => s.renameCollection);
  const removeToolFromCollection = useAppStore((s) => s.removeToolFromCollection);
  const navigateToTool = useAppStore((s) => s.navigateToTool);

  const isRtl = localeFromI18n === 'ar';

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCreate = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = createCollection(trimmed);
    setExpandedIds((prev) => new Set(prev).add(id));
    setNewName('');
    setIsCreating(false);
  }, [newName, createCollection]);

  const handleStartRename = useCallback((id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  }, []);

  const handleConfirmRename = useCallback(() => {
    if (editingId && editingName.trim()) {
      renameCollection(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  }, [editingId, editingName, renameCollection]);

  if (collections.length === 0 && !isCreating) {
    return (
      <section className="py-8 md:py-12" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="size-5 text-emerald-500" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              {t('common.collections')}
            </h2>
          </div>
          <div className="glass-card rounded-2xl p-6 text-center">
            <FolderPlus className="size-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              {t('common.emptyCollection')}
            </p>
            <Button
              onClick={() => setIsCreating(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              <Plus className="size-4" />
              {t('common.newCollection')}
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FolderOpen className="size-5 text-emerald-500" />
            <h2 className="text-lg md:text-xl font-bold text-foreground">
              {t('common.collections')}
            </h2>
          </div>
          {!isCreating && (
            <Button
              onClick={() => setIsCreating(true)}
              variant="outline"
              size="sm"
              className="gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
            >
              <Plus className="size-4" />
              {t('common.newCollection')}
            </Button>
          )}
        </div>

        {/* Create new collection inline */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4 overflow-hidden"
            >
              <div className="glass-card rounded-xl p-4 flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t('common.collectionName')}
                  className="flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') { setIsCreating(false); setNewName(''); }
                  }}
                />
                <Button
                  onClick={handleCreate}
                  size="sm"
                  disabled={!newName.trim()}
                  className="gap-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Check className="size-4" />
                  {t('common.createCollection')}
                </Button>
                <Button
                  onClick={() => { setIsCreating(false); setNewName(''); }}
                  variant="ghost"
                  size="icon"
                  className="size-9"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collection cards */}
        <div className="space-y-3">
          {collections.map((collection) => {
            const isExpanded = expandedIds.has(collection.id);
            const isEditing = editingId === collection.id;

            return (
              <motion.div
                key={collection.id}
                layout
                className="glass-card rounded-xl border border-border/50 overflow-hidden"
              >
                {/* Collection header */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleExpand(collection.id)}
                >
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="size-4 text-muted-foreground" />
                  </motion.div>
                  <FolderOpen className="size-4 text-emerald-500" />
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8 text-sm flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmRename();
                          if (e.key === 'Escape') { setEditingId(null); setEditingName(''); }
                        }}
                      />
                      <Button onClick={handleConfirmRename} size="icon" variant="ghost" className="size-7">
                        <Check className="size-3.5 text-emerald-500" />
                      </Button>
                      <Button onClick={() => { setEditingId(null); setEditingName(''); }} size="icon" variant="ghost" className="size-7">
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <span
                      className="font-medium text-foreground flex-1"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleStartRename(collection.id, collection.name);
                      }}
                      title={localeFromI18n === 'ar' ? 'انقر مرتين لإعادة التسمية' : 'Double-click to rename'}
                    >
                      {collection.name}
                    </span>
                  )}
                  <Badge variant="secondary" className="text-[11px] shrink-0">
                    {collection.tools.length}
                  </Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-red-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('common.deleteCollection')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {localeFromI18n === 'ar'
                            ? `هل أنت متأكد من حذف "${collection.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                            : `Are you sure you want to delete "${collection.name}"? This cannot be undone.`
                          }
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteCollection(collection.id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          {t('common.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {/* Expanded tools list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        {collection.tools.length === 0 ? (
                          <p className="text-sm text-muted-foreground py-3 text-center">
                            {t('common.emptyCollection')}
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                            {collection.tools.map((toolId) => {
                              const tool = getToolById(toolId);
                              if (!tool) return null;
                              const toolName = localize(tool.name, localeFromI18n);
                              return (
                                <div
                                  key={toolId}
                                  className="flex items-center gap-2 rounded-lg px-3 py-2 bg-muted/40 hover:bg-muted/70 transition-colors group"
                                >
                                  <span className="text-sm text-foreground flex-1 truncate">
                                    {toolName}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                    onClick={() => navigateToTool(toolId)}
                                    aria-label={localeFromI18n === 'ar' ? 'فتح الأداة' : 'Open Tool'}
                                  >
                                    <ExternalLink className="size-3.5" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                                    onClick={() => removeToolFromCollection(collection.id, toolId)}
                                    aria-label={t('common.removeFromCollection')}
                                  >
                                    <X className="size-3.5" />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

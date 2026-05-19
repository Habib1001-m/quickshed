'use client';

import { useState, useCallback } from 'react';
import { FolderPlus, Check, Plus, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AddToCollectionPopoverProps {
  toolId: string;
}

export function AddToCollectionPopover({ toolId }: AddToCollectionPopoverProps) {
  const { t, locale } = useI18n();
  const collections = useAppStore((s) => s.collections);
  const addToolToCollection = useAppStore((s) => s.addToolToCollection);
  const removeToolFromCollection = useAppStore((s) => s.removeToolFromCollection);
  const createCollection = useAppStore((s) => s.createCollection);

  const isRtl = locale === 'ar';
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const handleToggle = useCallback((collectionId: string, isInCollection: boolean) => {
    if (isInCollection) {
      removeToolFromCollection(collectionId, toolId);
    } else {
      addToolToCollection(collectionId, toolId);
    }
  }, [toolId, addToolToCollection, removeToolFromCollection]);

  const handleCreate = useCallback(() => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const id = createCollection(trimmed);
    addToolToCollection(id, toolId);
    setNewName('');
    setIsCreating(false);
  }, [newName, toolId, createCollection, addToolToCollection]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-full hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200"
          aria-label={t('common.addToCollection')}
        >
          <FolderPlus className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={isRtl ? 'start' : 'end'}
        className="w-64 p-2 glass-strong rounded-xl border-border/50"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-col gap-1">
          {collections.length === 0 && !isCreating && (
            <p className="text-sm text-muted-foreground py-3 text-center px-2">
              {t('common.emptyCollection')}
            </p>
          )}

          {collections.map((collection) => {
            const isInCollection = collection.tools.includes(toolId);
            return (
              <button
                key={collection.id}
                onClick={() => handleToggle(collection.id, isInCollection)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors w-full text-start"
              >
                <div className={`flex size-5 items-center justify-center rounded border shrink-0 transition-colors ${
                  isInCollection
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-muted-foreground/30'
                }`}>
                  {isInCollection && <Check className="size-3" />}
                </div>
                <span className="truncate">{collection.name}</span>
              </button>
            );
          })}

          {/* Create new collection */}
          {isCreating ? (
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('common.collectionName')}
                className="h-7 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                  if (e.key === 'Escape') { setIsCreating(false); setNewName(''); }
                }}
              />
              <Button
                onClick={handleCreate}
                size="icon"
                variant="ghost"
                className="size-7 shrink-0 text-emerald-600 hover:text-emerald-700"
                disabled={!newName.trim()}
              >
                <Check className="size-3.5" />
              </Button>
              <Button
                onClick={() => { setIsCreating(false); setNewName(''); }}
                size="icon"
                variant="ghost"
                className="size-7 shrink-0"
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-colors w-full text-start"
            >
              <Plus className="size-4" />
              {t('common.newCollection')}
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

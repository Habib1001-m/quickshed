'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, ChevronRight, Wrench, Construction, ArrowRight, Sparkles, Heart, Copy, Check, FolderPlus, Plus } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useI18n } from '@/lib/i18n';
import {
  getToolById,
  getCategoryBySlug,
  getRelatedTools,
  localize,
  getCategoryName,
  type ToolDescriptor,
} from '@/lib/tool-utils';
import { PrivacyBadge } from '@/components/PrivacyBadge';
import { DynamicIcon } from '@/components/IconMapper';
import { Button } from '@/components/ui/button';
import { ExportShareSection } from '@/components/ExportShareSection';

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { getToolComponent, ToolRenderer } from '@/components/tools';
import { ShareTool } from '@/components/ShareTool';
import { ToolRating } from '@/components/ToolRating';
import { ScrollProgress } from '@/components/ScrollProgress';
import { getCategoryColor } from '@/lib/category-config';

// ─── Tool Placeholder Component ─────────────────────────────────────

function ToolPlaceholder({ tool }: { tool: ToolDescriptor }) {
  const { t, locale } = useI18n();
  const toolName = localize(tool.name, locale);
  const toolDescription = localize(tool.description, locale);
  const accentClass = getCategoryColor(tool.category).icon;

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className={`flex size-16 items-center justify-center rounded-2xl mb-4 ${accentClass}`}>
          <DynamicIcon name={tool.icon} className="size-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {toolName}
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-md leading-relaxed">
          {toolDescription}
        </p>
        <div className="flex items-center gap-2 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-4 py-2 text-sm font-medium">
          <Construction className="size-4" />
          {t('common.loading')}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tool Content with Loading ──────────────────────────────────────

function ToolContent({ tool }: { tool: ToolDescriptor }) {
  const { locale } = useI18n();
  const toolComponentAvailable = getToolComponent(tool.component) !== null;

  if (!toolComponentAvailable) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="tool-content-enter"
      >
        <ToolPlaceholder tool={tool} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="tool-content-enter"
    >
      <ToolRenderer componentName={tool.component} locale={locale} />
    </motion.div>
  );
}

// ─── Compact Related Tool Card ───────────────────────────────────────

function CompactToolCard({ tool }: { tool: ToolDescriptor }) {
  const { locale } = useI18n();
  const navigateToTool = useAppStore((s) => s.navigateToTool);
  const accentClass = getCategoryColor(tool.category).icon;
  const toolName = localize(tool.name, locale);

  return (
    <button
      onClick={() => navigateToTool(tool.id)}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-start
        transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-500/30 card-elevated glow-ring-hover
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        w-full min-w-[200px] shrink-0 sm:shrink"
    >
      <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accentClass}
        transition-transform duration-200 group-hover:scale-110`}>
        <DynamicIcon name={tool.icon} className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {toolName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <PrivacyBadge level={tool.privacy} />
        </div>
      </div>
      <ArrowRight className="size-4 text-muted-foreground/50 shrink-0 rtl:rotate-180
        group-hover:text-emerald-500 transition-colors" />
    </button>
  );
}

// ─── Quick Actions Bar ────────────────────────────────────────────────

function QuickActionsBar({ tool }: { tool: ToolDescriptor }) {
  const { t, locale } = useI18n();
  const isRtl = locale === 'ar';
  const [linkCopied, setLinkCopied] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collectionPopoverOpen, setCollectionPopoverOpen] = useState(false);

  const collections = useAppStore((s) => s.collections);
  const addToolToCollection = useAppStore((s) => s.addToolToCollection);
  const removeToolFromCollection = useAppStore((s) => s.removeToolFromCollection);
  const createCollection = useAppStore((s) => s.createCollection);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/${locale}/tools/${encodeURIComponent(tool.id)}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) return;
    const id = createCollection(newCollectionName.trim());
    addToolToCollection(id, tool.id);
    setNewCollectionName('');
    setCollectionPopoverOpen(false);
  };

  const isToolInCollection = (collectionId: string) => {
    const collection = collections.find((c) => c.id === collectionId);
    return collection ? collection.tools.includes(tool.id) : false;
  };

  const handleToggleCollection = (collectionId: string) => {
    if (isToolInCollection(collectionId)) {
      removeToolFromCollection(collectionId, tool.id);
    } else {
      addToolToCollection(collectionId, tool.id);
    }
  };

  return (
    <div
      className="quick-actions-glass rounded-xl p-3 flex items-center gap-2 flex-wrap"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Copy Tool Link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopyLink}
        className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-emerald-500/10 glow-focus"
      >
        {linkCopied ? (
          <Check className="size-3.5 text-emerald-500" />
        ) : (
          <Copy className="size-3.5" />
        )}
        {linkCopied
          ? t('tool.copied')
          : t('common.copyLink')
        }
      </Button>

      {/* Add to Collection Popover */}
      <Popover open={collectionPopoverOpen} onOpenChange={setCollectionPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground hover:bg-emerald-500/10 glow-focus"
          >
            <FolderPlus className="size-3.5" />
            {t('common.addToCollection')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">{t('common.collections')}</p>

            {/* Existing collections */}
            {collections.length > 0 ? (
              <div className="max-h-40 overflow-y-auto space-y-1 scrollbar-thin">
                {collections.map((col) => {
                  const isIn = isToolInCollection(col.id);
                  return (
                    <button
                      key={col.id}
                      onClick={() => handleToggleCollection(col.id)}
                      className={`
                        w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm text-start
                        transition-colors duration-150
                        ${isIn
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                        }
                      `}
                    >
                      <div className={`size-3 rounded-sm border-2 transition-colors ${isIn ? 'bg-emerald-500 border-emerald-500' : 'border-muted-foreground/40'}`} />
                      <span className="truncate">{col.name}</span>
                      <span className="ms-auto text-[10px] text-muted-foreground">{col.tools.length}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                {t('common.noCollectionsYet')}
              </p>
            )}

            {/* Create new collection */}
            <div className="border-t pt-2 mt-2">
              <div className="flex gap-1.5">
                <Input
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder={t('common.collectionName')}
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateCollection();
                  }}
                />
                <Button
                  size="sm"
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim()}
                  className="h-8 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white shrink-0"
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Share */}
      <ShareTool toolId={tool.id} toolName={localize(tool.name, locale)} />
    </div>
  );
}

// ─── ToolView Component ─────────────────────────────────────────────

export function ToolView() {
  const { t, locale } = useI18n();
  const selectedTool = useAppStore((s) => s.selectedTool);
  const navigateHome = useAppStore((s) => s.navigateHome);
  const navigateToCategory = useAppStore((s) => s.navigateToCategory);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const addRecentTool = useAppStore((s) => s.addRecentTool);
  const incrementToolUsage = useAppStore((s) => s.incrementToolUsage);
  const isRtl = locale === 'ar';

  // Add tool to recently used and increment usage when opened
  useEffect(() => {
    if (selectedTool) {
      addRecentTool(selectedTool);
      incrementToolUsage(selectedTool);
    }
  }, [selectedTool, addRecentTool, incrementToolUsage]);

  // Get tool data
  const tool = useMemo(
    () => (selectedTool ? getToolById(selectedTool) : undefined),
    [selectedTool]
  );

  const category = useMemo(
    () => (tool ? getCategoryBySlug(tool.category) : undefined),
    [tool]
  );

  const relatedTools = useMemo(
    () => (tool ? getRelatedTools(tool.id, 4) : []),
    [tool]
  );

  // If no tool selected, show not found
  if (!tool) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 gap-4"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <Wrench className="size-12 text-muted-foreground/40" />
        <p className="text-lg text-muted-foreground">{t('tool.error')}</p>
        <Button variant="outline" onClick={navigateHome}>
          {t('tool.backToHome')}
        </Button>
      </div>
    );
  }

  const toolName = localize(tool.name, locale);
  const toolDescription = localize(tool.description, locale);
  const categoryName = category ? localize(category.name, locale) : getCategoryName(tool.category, locale);
  const colors = getCategoryColor(tool.category);
  const accentClass = colors.icon;
  const gradient = colors.gradient;

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      {/* ─── Breadcrumb ──────────────────────────────────────────────── */}
      <section className="border-b border-border/50 bg-muted/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="cursor-pointer"
                >
                  <button
                    onClick={navigateHome}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    <Home className="size-3.5" />
                    {t('header.home')}
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="size-3.5 rtl:rotate-180" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="cursor-pointer"
                >
                  <button
                    onClick={() => navigateToCategory(tool.category)}
                    className="text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                    {categoryName}
                  </button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="size-3.5 rtl:rotate-180" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  {toolName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* ─── Tool Header with gradient background ──────────────────── */}
      <section className="relative overflow-hidden border-b">
        {/* Subtle gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient.from} ${gradient.to} via-transparent pointer-events-none mesh-gradient`} />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <div className="flex items-start gap-5">
            {/* Larger icon with animated gradient border */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="relative shrink-0"
            >
              <div className={`flex size-16 md:size-20 items-center justify-center rounded-2xl ${accentClass}
                ring-2 ring-inset ring-foreground/5 shadow-lg animate-pulse-ring icon-glow-ring icon-glow-ring-animate`}>
                <DynamicIcon name={tool.icon} className="size-8 md:size-10" />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="flex items-center gap-3 flex-wrap"
              >
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground">
                  {toolName}
                </h1>
                <button
                  onClick={() => toggleFavorite(tool.id)}
                  aria-label={favorites.includes(tool.id) ? t('home.removeFromFavorites') : t('home.addToFavorites')}
                  className="inline-flex items-center justify-center size-9 rounded-full transition-all duration-200 hover:scale-110 micro-bounce focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Heart
                    className={`size-5 transition-colors ${
                      favorites.includes(tool.id)
                        ? 'fill-red-500 text-red-500 heart-pulse'
                        : 'text-muted-foreground hover:text-red-400'
                    }`}
                  />
                </button>
                <PrivacyBadge level={tool.privacy} />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="text-muted-foreground mt-2 leading-relaxed text-base max-w-2xl"
              >
                {toolDescription}
              </motion.p>
            </div>
          </div>

          {/* ─── Quick Actions Bar ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-6"
          >
            <QuickActionsBar tool={tool} />
          </motion.div>
        </div>
      </section>

      {/* ─── Scroll Progress ─────────────────────────────────────────── */}
      <ScrollProgress />

      {/* ─── Tool Content Area ──────────────────────────────────────── */}
      <section className="py-8 md:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="tool-wrapper-card rounded-2xl border border-border bg-card shadow-sm p-4 sm:p-6 md:p-8 card-elevated"
          >
            <ToolContent key={tool.id} tool={tool} />
          </motion.div>

          {/* ─── Tool Rating ─────────────────────────────────────────── */}
          <div className="mt-8 flex items-center justify-center">
            <ToolRating toolId={tool.id} />
          </div>

          {/* ─── Export & Share Section ──────────────────────────────── */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ExportShareSection toolId={tool.id} toolName={toolName} />
          </div>
        </div>
      </section>

      {/* ─── Related Tools ──────────────────────────────────────────── */}
      {relatedTools.length > 0 && (
        <section className="py-8 md:py-12 bg-muted/10 border-t">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2 mb-6"
            >
              <Sparkles className="size-5 text-emerald-500" />
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {t('tool.youMightAlsoLike')}
              </h2>
            </motion.div>

            {/* Horizontal scroll on mobile, grid on desktop */}
            <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-x-visible
              scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {relatedTools.map((relatedTool, i) => (
                <motion.div
                  key={relatedTool.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  <CompactToolCard tool={relatedTool} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

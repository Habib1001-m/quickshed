'use client';

import { useI18n } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import { DidYouKnowTip } from '@/components/DidYouKnowTip';
import { ToolCollections } from '@/components/ToolCollections';
import { UsageDashboard } from '@/components/UsageDashboard';
import { ToolHistoryTimeline } from '@/components/ToolHistoryTimeline';
import { SmartRecommendations } from '@/components/SmartRecommendations';
import { HomeCategoriesSection } from '@/components/home/HomeCategoriesSection';
import { HomeCtaSection } from '@/components/home/HomeCtaSection';
import { HomeFavoritesSection } from '@/components/home/HomeFavoritesSection';
import { HomeFeatureSection } from '@/components/home/HomeFeatureSection';
import { HomeFeaturedToolsSection } from '@/components/home/HomeFeaturedToolsSection';
import { HomeHeroSection } from '@/components/home/HomeHeroSection';
import { HomeRecentToolsSection } from '@/components/home/HomeRecentToolsSection';
import { HomeSpotlightSection } from '@/components/home/HomeSpotlightSection';

export function HomeView() {
  const { locale } = useI18n();
  const collections = useAppStore((s) => s.collections);
  const isRtl = locale === 'ar';

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <HomeHeroSection />
      <HomeFeatureSection />
      <DidYouKnowTip />
      <UsageDashboard />
      <SmartRecommendations />
      <ToolHistoryTimeline />
      <HomeRecentToolsSection />
      <HomeFavoritesSection />
      {collections.length > 0 && <ToolCollections />}
      <HomeCategoriesSection />
      <HomeSpotlightSection />
      <HomeFeaturedToolsSection />
      <HomeCtaSection />
    </div>
  );
}

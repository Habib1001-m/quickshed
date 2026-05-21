import { LOCALES, type AppLocale } from '@/lib/site-config';
import RoutePageShell from '@/components/RoutePageShell';

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <RoutePageShell initialView="home" initialLocale={locale} />;
}

import { LOCALES } from '@/lib/site-config';
import StaticPageShell from '@/components/StaticPageShell';

interface BlogLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function BlogLayout({ children, params }: BlogLayoutProps) {
  const { locale } = await params;

  return (
    <StaticPageShell locale={locale}>
      {children}
    </StaticPageShell>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Scale, ArrowLeft } from 'lucide-react';
import { SITE_URL, LOCALES, type AppLocale } from '@/lib/site-config';

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';
  const title = isArabic ? 'شروط الخدمة — QuickShed' : 'Terms of Service — QuickShed';
  const description = isArabic
    ? 'شروط خدمة QuickShed. مجاني للاستخدام، لا يتطلب حسابات.'
    : 'QuickShed Terms of Service. Free to use, no accounts required.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'QuickShed',
      type: 'website',
      url: `${SITE_URL}/${locale}/terms`,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/terms`,
      languages: {
        en: `${SITE_URL}/en/terms`,
        ar: `${SITE_URL}/ar/terms`,
      },
    },
  };
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  const loc = (locale === 'ar' || locale === 'en' ? locale : 'en') as AppLocale;
  const isArabic = loc === 'ar';

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/20 dark:to-transparent border-b border-border/50">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            {isArabic ? 'العودة إلى QuickShed' : 'Back to QuickShed'}
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <Scale className="size-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              {isArabic ? 'شروط الخدمة' : 'Terms of Service'}
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {isArabic ? 'آخر تحديث: ١٩ مايو ٢٠٢٦' : 'Last updated: May 19, 2026'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <section className="space-y-8 text-base leading-7">
          <div className="glass-card rounded-2xl p-6 border-s-4 border-emerald-500">
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'قبول الشروط' : 'Acceptance of Terms'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'باستخدامك لـ QuickShed، فإنك توافق على هذه الشروط. QuickShed خدمة مجانية ومفتوحة الوصول. لا يلزم حساب أو تسجيل.'
                : 'By using QuickShed, you agree to these terms. QuickShed is a free, open-access service. No account or registration is required.'}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'استخدام الخدمة' : 'Use of Service'}
            </h2>
            <ul className="space-y-3">
              {[
                isArabic
                  ? 'أدوات QuickShed مخصصة للاستخدام الشخصي والمهني، مجانًا.'
                  : 'QuickShed tools are provided for personal and professional use, free of charge.',
                isArabic
                  ? 'لا يجوز استخدام QuickShed لمعالجة محتوى غير قانوني أو ضار أو خبيث.'
                  : 'You may not use QuickShed to process illegal, harmful, or malicious content.',
                isArabic
                  ? 'يُمنع الكشط الآلي أو إساءة استخدام الخدمة.'
                  : 'Automated scraping or abuse of the service is prohibited.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 dark:bg-muted/20">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'بدون ضمان' : 'No Warranty'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? (
                <>
                  أدوات QuickShed مقدمة <strong className="text-foreground">كما هي</strong>. بينما نسعى للدقة، يجب التحقق من النتائج بشكل مستقل للحالات الحرجة. QuickShed غير مسؤول عن الأخطاء في مخرجات الأدوات.
                </>
              ) : (
                <>
                  QuickShed tools are provided <strong className="text-foreground">as-is</strong>. While we strive for accuracy, results should be verified independently for critical use cases. QuickShed is not liable for errors in tool output.
                </>
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'الملكية الفكرية' : 'Intellectual Property'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'اسم QuickShed وشعاره وتصميمه ملكية خاصة. تنفيذ الأدوات أعمال أصلية. أنت تحتفظ بجميع الحقوق لأي بيانات تعالجها باستخدام أدواتنا.'
                : 'The QuickShed name, logo, and design are proprietary. Tool implementations are original works. You retain all rights to any data you process using our tools.'}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'التغييرات على الشروط' : 'Changes to Terms'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'قد نقوم بتحديث هذه الشروط من وقت لآخر. الاستمرار في استخدام QuickShed بعد التغييرات يشكل قبولاً للشروط المحدثة.'
                : 'We may update these terms occasionally. Continued use of QuickShed after changes constitutes acceptance of the updated terms.'}
            </p>
          </div>

          <div className="pt-4 border-t border-border/50">
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'اتصل بنا' : 'Contact'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? (
                <>
                  أسئلة حول هذه الشروط؟ تواصل معنا عبر صفحتنا على{' '}
                  <a href="https://github.com/quickshed" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                    GitHub
                  </a>.
                </>
              ) : (
                <>
                  Questions about these terms? Reach us via our{' '}
                  <a href="https://github.com/quickshed" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                    GitHub
                  </a>{' '}
                  page.
                </>
              )}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

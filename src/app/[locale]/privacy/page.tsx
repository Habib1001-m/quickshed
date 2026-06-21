import type { Metadata } from 'next';
import { Shield } from 'lucide-react';
import { SITE_URL, REPOSITORY_URL, LOCALES, type AppLocale } from '@/lib/site-config';

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === 'ar';
  const title = isArabic ? 'سياسة الخصوصية — QuickShed' : 'Privacy Policy — QuickShed';
  const description = isArabic
    ? 'سياسة خصوصية QuickShed. لا نجمع أي بيانات شخصية. جميع الأدوات تعمل محلياً في متصفحك.'
    : 'QuickShed Privacy Policy. We collect no personal data. All tools run locally in your browser.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'QuickShed',
      type: 'website',
      url: `${SITE_URL}/${locale}/privacy`,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}/privacy`,
      languages: {
        en: `${SITE_URL}/en/privacy`,
        ar: `${SITE_URL}/ar/privacy`,
      },
    },
  };
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  const loc = (locale === 'ar' || locale === 'en' ? locale : 'en') as AppLocale;
  const isArabic = loc === 'ar';

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
          <Shield className="size-6" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          {isArabic ? 'سياسة الخصوصية' : 'Privacy Policy'}
        </h1>
      </div>
      <p className="text-muted-foreground text-sm mb-8">
        {isArabic ? 'آخر تحديث: ١٩ مايو ٢٠٢٦' : 'Last updated: May 19, 2026'}
      </p>

      {/* Content */}
      <section className="space-y-8 text-base leading-7">
          <div className="glass-card rounded-2xl p-6 border-s-4 border-emerald-500">
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'وعدنا بالخصوصية' : 'Our Privacy Promise'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? (
                <>
                  QuickShed مبني على مبدأ بسيط:{' '}
                  <strong className="text-foreground">بياناتك لا تغادر جهازك أبدًا.</strong>{' '}
                  جميع الأدوات تعمل بالكامل في متصفحك باستخدام واجهات برمجة الويب القياسية. لا نقوم بجمع أو تخزين أو نقل أي بيانات شخصية أو ملفات أو مدخلات تقدمها لأدواتنا.
                </>
              ) : (
                <>
                  QuickShed is built on a simple principle:{' '}
                  <strong className="text-foreground">your data never leaves your device.</strong>{' '}
                  All tools run entirely in your browser using standard Web APIs. We do not collect, store, or transmit any personal data, files, or inputs you provide to our tools.
                </>
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'ما نجمعه' : 'What We Collect'}
            </h2>
            <ul className="space-y-3">
              {[
                {
                  num: '1',
                  title: isArabic ? 'لا شيء عن استخدامك للأدوات.' : 'Nothing about your tool usage.',
                  desc: isArabic
                    ? 'الملفات التي تعالجها (الصور، ملفات PDF، النصوص) تتم معالجتها بالكامل من جانب العميل ولا يتم رفعها أبدًا.'
                    : 'Files you process (images, PDFs, text) are handled entirely client-side and never uploaded.',
                },
                {
                  num: '2',
                  title: isArabic ? 'لا تحليلات حالياً.' : 'No analytics currently.',
                  desc: isArabic
                    ? 'لا نستخدم حالياً أي سكربت تحليلات أو تتبع تابع لطرف ثالث. إذا أضفنا قياساً يحترم الخصوصية لاحقاً، فسيتم توثيقه هنا قبل الإطلاق.'
                    : 'We currently use no analytics scripts and no third-party tracking. If privacy-friendly measurement is added later, it will be documented here before launch.',
                },
                {
                  num: '3',
                  title: isArabic ? 'تفضيلات التخزين المحلي.' : 'LocalStorage preferences.',
                  desc: isArabic
                    ? 'نخزن تفضيل لغتك واختيار السمة وأدواتك المفضلة محليًا في متصفحك. هذه البيانات لا تغادر جهازك أبدًا.'
                    : 'We store your language preference, theme choice, and favorite tools locally in your browser. This data never leaves your device.',
                },
              ].map((item) => (
                <li key={item.num} className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 dark:bg-muted/20">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                    {item.num}
                  </span>
                  <div>
                    <strong className="text-foreground">{item.title}</strong>{' '}
                    <span className="text-muted-foreground">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'ملفات تعريف الارتباط' : 'Cookies'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? (
                <>
                  QuickShed يستخدم <strong className="text-foreground">لا ملفات تعريف ارتباط للتتبع</strong>. التخزين الوحيد المستخدم في المتصفح هو{' '}
                  <code className="text-sm bg-muted dark:bg-muted/50 px-2 py-0.5 rounded font-mono">localStorage</code>{' '}
                  لتفضيلاتك (السمة، اللغة، المفضلة). يمكنك مسح هذا في أي وقت عبر الإعدادات ← مسح جميع البيانات.
                </>
              ) : (
                <>
                  QuickShed uses <strong className="text-foreground">no tracking cookies</strong>. The only browser storage used is{' '}
                  <code className="text-sm bg-muted dark:bg-muted/50 px-2 py-0.5 rounded font-mono">localStorage</code>{' '}
                  for your preferences (theme, language, favorites). You can clear this at any time via Settings &rarr; Clear All Data.
                </>
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'خدمات الطرف الثالث' : 'Third-Party Services'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'عدد صغير من الأدوات قد يكون موسومًا بشارة برتقالية تشير إلى أنها تستخدم واجهة برمجة تطبيقات خارجية آمنة. يتم الإفصاح عن ذلك دائمًا بشكل بارز قبل نقل أي بيانات. لا يتم تضمين مفاتيح API في الكود من جانب العميل.'
                : 'A small number of tools may be marked with an orange badge indicating they use a secure external API. This is always disclosed prominently before any data is transmitted. No API keys are embedded in client-side code.'}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'الأمان' : 'Security'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'الموقع يُقدم عبر HTTPS ويستخدم رؤوس أمان للمتصفح، بما في ذلك سياسة أمان المحتوى (CSP)، وتقليل صلاحيات المتصفح، ومنع التضمين داخل الإطارات. نتابع تنبيهات الاعتماديات عبر GitHub Dependabot ونوثق قرارات المعالجة أو قبول المخاطر قبل الإطلاق.'
                : 'The site is served over HTTPS and uses browser security headers, including Content Security Policy (CSP), reduced browser permissions, and frame protection. Dependency alerts are tracked through GitHub Dependabot, with remediation or risk decisions documented before launch.'}
            </p>
          </div>

          <div className="pt-4 border-t border-border/50">
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'اتصل بنا' : 'Contact'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? (
                <>
                  أسئلة حول هذه السياسة؟ تواصل معنا عبر صفحتنا على{' '}
                  <a href={REPOSITORY_URL} className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                    GitHub
                  </a>.
                </>
              ) : (
                <>
                  Questions about this policy? Reach us via our{' '}
                  <a href={REPOSITORY_URL} className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                    GitHub
                  </a>{' '}
                  page.
                </>
              )}
            </p>
          </div>
        </section>
    </div>
  );
}

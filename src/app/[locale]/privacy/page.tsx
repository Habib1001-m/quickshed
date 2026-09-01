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
    ? 'سياسة خصوصية QuickShed. توضّح شارات الأدوات ما إذا كانت المعالجة تتم في متصفحك أو داخل ملف أو باستخدام تخزين المتصفح أو عبر خدمة خارجية.'
    : 'QuickShed privacy policy. Tool badges explain whether processing stays in your browser, uses a file, saves data in browser storage, or uses an external service.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'QuickShed',
      type: 'website',
      url: `${SITE_URL}/${locale}/privacy`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
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
        {isArabic ? 'آخر تحديث: ١ سبتمبر ٢٠٢٦' : 'Last updated: September 1, 2026'}
      </p>

      {/* Content */}
      <section className="space-y-8 text-base leading-7">
          <div className="glass-card rounded-2xl p-6 border-s-4 border-emerald-500">
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'وعدنا بالخصوصية' : 'Our Privacy Promise'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'توضح QuickShed كيفية تعامل كل أداة مع البيانات. الأدوات المعلّمة «محلي» أو «داخل الملف» أو «على الجهاز» تعالج البيانات في متصفحك، وقد تحفظ أدوات «على الجهاز» بيانات محددة في تخزين المتصفح. إذا استخدمت أداة خدمة خارجية، فستحمل شارة API ويُفصح عن النقل قبل حدوثه.'
                : 'QuickShed shows how each tool handles data. Tools marked Local, File-only, or On-device process data in your browser, and On-device tools may save selected data in browser storage. If a tool uses an external service, it is marked API and the transfer is disclosed before it occurs.'}
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
                  title: isArabic ? 'معالجة مدخلات الأدوات.' : 'Tool input processing.',
                  desc: isArabic
                    ? 'الأدوات المعلّمة «محلي» أو «داخل الملف» تعالج الملفات والنصوص في متصفحك. لا يعلن كتالوج الأدوات الحالي عن نقل مدخلات الأدوات إلى واجهة برمجة خارجية.'
                    : 'Tools marked Local or File-only process files and text in your browser. The current tool catalog declares no external API egress for tool inputs.',
                },
                {
                  num: '2',
                  title: isArabic ? 'لا تحليلات للمنتج.' : 'No product analytics.',
                  desc: isArabic
                    ? 'لا تستخدم QuickShed حالياً تحليلات للمنتج أو نصوص تتبع تابعة لطرف ثالث.'
                    : 'QuickShed currently uses no product analytics or third-party tracking scripts.',
                },
                {
                  num: '3',
                  title: isArabic ? 'تخزين المتصفح.' : 'Browser storage.',
                  desc: isArabic
                    ? 'يستخدم QuickShed localStorage لتفضيلاتك (السمة واللغة) ولبيانات مختارة تحفظها أدوات «على الجهاز»، مثل المفضلة والسجل والمجموعات والملاحظات والعادات وروابط مختصر الروابط. تبقى هذه البيانات في متصفحك ويمكنك إزالتها عبر الإعدادات ← مسح جميع البيانات.'
                    : 'QuickShed uses localStorage for your preferences (theme and language) and selected data saved by On-device tools, such as favorites, history, collections, notes, habits, and URL-shortener links. This data stays in your browser and can be removed through Settings &rarr; Clear All Data.',
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
                  لا يستخدم QuickShed <strong className="text-foreground">ملفات تعريف ارتباط للتتبع</strong>. يستخدم المتصفح{' '}
                  <code className="text-sm bg-muted dark:bg-muted/50 px-2 py-0.5 rounded font-mono">localStorage</code>{' '}
                  للاحتفاظ بالتفضيلات والبيانات المختارة للأدوات المعلّمة «على الجهاز». تصف هذه السياسة تدفق بيانات الأدوات، ولا تتعهد بما قد تحتفظ به خدمات الاستضافة من بيانات طلبات الموقع. يمكنك إزالة بيانات QuickShed المخزّنة عبر الإعدادات ← مسح جميع البيانات.
                </>
              ) : (
                <>
                  QuickShed uses <strong className="text-foreground">no tracking cookies</strong>. The browser uses{' '}
                  <code className="text-sm bg-muted dark:bg-muted/50 px-2 py-0.5 rounded font-mono">localStorage</code>{' '}
                  for preferences and selected data from tools marked On-device. This policy describes tool data flow and does not make claims about data that hosting services may retain from site requests. Remove QuickShed’s stored data through Settings &rarr; Clear All Data.
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
                ? 'إذا استخدمت أداة خدمة خارجية، فستحمل شارة API البرتقالية ويظهر الإفصاح قبل نقل البيانات. لا تُضمَّن مفاتيح API في كود العميل.'
                : 'If a tool uses an external service, it carries the orange API badge and discloses the transfer before data is sent. API keys are not embedded in client-side code.'}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'الأمان' : 'Security'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'يُقدَّم الموقع عبر HTTPS ويستخدم رؤوس أمان للمتصفح، بما في ذلك سياسة أمان المحتوى (CSP)، وتقليل صلاحيات المتصفح، ومنع التضمين داخل الإطارات. تُتابَع تنبيهات الاعتماديات عبر GitHub Dependabot، وتفشل بوابة الإصدار عند وجود ثغرات إنتاجية حرجة.'
                : 'The site is served over HTTPS and uses browser security headers, including Content Security Policy (CSP), reduced browser permissions, and frame protection. Dependency alerts are tracked through GitHub Dependabot, and critical production advisories fail the release gate.'}
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

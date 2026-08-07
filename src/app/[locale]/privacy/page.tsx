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
        {isArabic ? 'آخر تحديث: ٥ أغسطس ٢٠٢٦' : 'Last updated: August 5, 2026'}
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
                  QuickShed مبني على مبدأ محلي واضح:{' '}
                  <strong className="text-foreground">مدخلات الأدوات وملفاتك لا يرسلها التطبيق خارج جهازك.</strong>{' '}
                  تعمل الأدوات بالكامل في متصفحك باستخدام واجهات برمجة الويب القياسية، ولا نرسل تحليلات استخدام المنتج. يحتاج مزود الاستضافة إلى استقبال طلب الصفحة حتى يقدم الموقع؛ ولا يحدد هذا المستودع سجلات الاستضافة أو مدة الاحتفاظ بها.
                </>
              ) : (
                <>
                  QuickShed follows a local-first promise:{' '}
                  <strong className="text-foreground">the application does not transmit your tool inputs or files off your device.</strong>{' '}
                  Tools run entirely in your browser using standard Web APIs, and we do not send product-usage analytics. The hosting provider still receives the page request needed to serve the site; this repository does not define host access logs or their retention.
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
                  title: isArabic ? 'مدخلات الأدوات.' : 'Tool inputs.',
                  desc: isArabic
                    ? 'الصور وملفات PDF والنصوص التي تعالجها تبقى داخل متصفحك ولا يرفعها التطبيق.'
                    : 'Images, PDFs, and text you process stay in your browser and are not uploaded by the application.',
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
                  title: isArabic ? 'بيانات التخزين المحلي.' : 'LocalStorage data.',
                  desc: isArabic
                    ? 'نستخدم localStorage لتفضيلاتك والتقييمات المحلية وسجل الأدوات والمفضلة، ولبيانات بعض الأدوات مثل العادات والملاحظات وروابط مُقصِّر الروابط. تبقى هذه البيانات في متصفحك ولا ينقلها التطبيق عبر الشبكة. يمكنك إزالة بيانات QuickShed المخزّنة عبر الإعدادات ← مسح جميع البيانات.'
                    : 'We use localStorage for preferences, local ratings, tool history, favorites, and on-device data from some tools such as habits, notes, and URL-shortener links. This data stays in your browser and is not transmitted by the application. Remove QuickShed’s stored data via Settings &rarr; Clear All Data.',
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
              {isArabic ? 'طلبات الاستضافة' : 'Hosting Requests'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic
                ? 'عند فتح أي صفحة، يعالج مزود الاستضافة طلبًا قياسيًا لتقديمها. لا يرسل التطبيق مدخلات الأدوات أو تحليلات الاستخدام ضمن هذا الطلب؛ أما سجلات الوصول ومدة الاحتفاظ بها فتخضع لمزود الاستضافة وليست مضبوطة في هذا المستودع.'
                : 'When you open a page, the hosting provider processes a standard request to deliver it. The application does not include tool inputs or product analytics in that request; access logs and retention are controlled by the hosting provider and are not configured in this repository.'}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">
              {isArabic ? 'ملفات تعريف الارتباط' : 'Cookies'}
            </h2>
            <p className="text-muted-foreground">
              {isArabic ? (
                <>
                  لا يستخدم QuickShed أي <strong className="text-foreground">ملفات تعريف ارتباط للتتبع</strong>. تُحفظ تفضيلات المستخدم وبيانات الأدوات في{' '}
                  <code className="text-sm bg-muted dark:bg-muted/50 text-foreground px-2 py-0.5 rounded font-mono">localStorage</code>،
                  وقد يستخدم Service Worker تخزين <code className="text-sm bg-muted dark:bg-muted/50 text-foreground px-2 py-0.5 rounded font-mono">Cache Storage</code> لبعض الأصول الثابتة المحددة بعد تحميلها؛ ولا ينقل أي من مساري التخزين مدخلات الأدوات عبر التطبيق. يمكنك إزالة بيانات QuickShed المخزّنة عبر الإعدادات ← مسح جميع البيانات.
                </>
              ) : (
                <>
                  QuickShed uses <strong className="text-foreground">no tracking cookies</strong>. User preferences and tool data are stored in{' '}
                  <code className="text-sm bg-muted dark:bg-muted/50 text-foreground px-2 py-0.5 rounded font-mono">localStorage</code>,
                  and the Service Worker may use <code className="text-sm bg-muted dark:bg-muted/50 text-foreground px-2 py-0.5 rounded font-mono">Cache Storage</code> for selected static assets after they load; neither storage path transmits tool inputs through the application. Remove QuickShed’s stored data via Settings &rarr; Clear All Data.
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
                ? 'لا تعلن أي أداة إنتاجية حالياً عن نقل بيانات إلى API خارجي. إذا تغير ذلك، فستظهر وجهة البيانات والغرض منها بوضوح قبل أي نقل، ولن تُضمّن مفاتيح API في كود المتصفح.'
                : 'No production tool currently declares external API egress. If that changes, the destination and purpose will be disclosed before any transfer, and API keys will not be embedded in browser code.'}
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
                  <a href={REPOSITORY_URL} className="text-emerald-800 dark:text-emerald-300 hover:underline font-medium">
                    GitHub
                  </a>.
                </>
              ) : (
                <>
                  Questions about this policy? Reach us via our{' '}
                  <a href={REPOSITORY_URL} className="text-emerald-800 dark:text-emerald-300 hover:underline font-medium">
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

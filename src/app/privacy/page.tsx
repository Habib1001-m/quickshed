import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — QuickShed",
  description: "QuickShed Privacy Policy. We collect no personal data. All tools run locally in your browser.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/20 dark:to-transparent border-b border-border/50">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Back to QuickShed
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <Shield className="size-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
          </div>
          <p className="text-muted-foreground text-sm">Last updated: May 19, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <section className="space-y-8 text-base leading-7">
          <div className="glass-card rounded-2xl p-6 border-l-4 border-emerald-500">
            <h2 className="text-xl font-semibold mb-3 text-foreground">Our Privacy Promise</h2>
            <p className="text-muted-foreground">QuickShed is built on a simple principle: <strong className="text-foreground">your data never leaves your device.</strong> All tools run entirely in your browser using standard Web APIs. We do not collect, store, or transmit any personal data, files, or inputs you provide to our tools.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">What We Collect</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 dark:bg-muted/20">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">1</span>
                <div><strong className="text-foreground">Nothing about your tool usage.</strong> <span className="text-muted-foreground">Files you process (images, PDFs, text) are handled entirely client-side and never uploaded.</span></div>
              </li>
              <li className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 dark:bg-muted/20">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">2</span>
                <div><strong className="text-foreground">Anonymous analytics only.</strong> <span className="text-muted-foreground">We use privacy-friendly analytics (Plausible) that collects no personal identifiers, no IP addresses, and sets no cookies.</span></div>
              </li>
              <li className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 dark:bg-muted/20">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">3</span>
                <div><strong className="text-foreground">LocalStorage preferences.</strong> <span className="text-muted-foreground">We store your language preference, theme choice, and favorite tools locally in your browser. This data never leaves your device.</span></div>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Cookies</h2>
            <p className="text-muted-foreground">QuickShed uses <strong className="text-foreground">no tracking cookies</strong>. The only browser storage used is <code className="text-sm bg-muted dark:bg-muted/50 px-2 py-0.5 rounded font-mono">localStorage</code> for your preferences (theme, language, favorites). You can clear this at any time via Settings &rarr; Clear All Data.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Third-Party Services</h2>
            <p className="text-muted-foreground">A small number of tools may be marked with an orange badge indicating they use a secure external API. This is always disclosed prominently before any data is transmitted. No API keys are embedded in client-side code.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Security</h2>
            <p className="text-muted-foreground">The site is served over HTTPS. Strict Content Security Policy (CSP) headers prevent unauthorized scripts. We run weekly dependency audits and patch critical vulnerabilities within 24 hours.</p>
          </div>

          <div className="pt-4 border-t border-border/50">
            <h2 className="text-xl font-semibold mb-3 text-foreground">Contact</h2>
            <p className="text-muted-foreground">Questions about this policy? Reach us via our <a href="https://github.com/quickshed" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">GitHub</a> page.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

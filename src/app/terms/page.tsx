import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — QuickShed",
  description: "QuickShed Terms of Service. Free to use, no accounts required.",
};

export default function TermsPage() {
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
              <Scale className="size-6" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
          </div>
          <p className="text-muted-foreground text-sm">Last updated: May 19, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <section className="space-y-8 text-base leading-7">
          <div className="glass-card rounded-2xl p-6 border-l-4 border-emerald-500">
            <h2 className="text-xl font-semibold mb-3 text-foreground">Acceptance of Terms</h2>
            <p className="text-muted-foreground">By using QuickShed, you agree to these terms. QuickShed is a free, open-access service. No account or registration is required.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Use of Service</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 dark:bg-muted/20">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">1</span>
                <span className="text-muted-foreground">QuickShed tools are provided for personal and professional use, free of charge.</span>
              </li>
              <li className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 dark:bg-muted/20">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">2</span>
                <span className="text-muted-foreground">You may not use QuickShed to process illegal, harmful, or malicious content.</span>
              </li>
              <li className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 dark:bg-muted/20">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">3</span>
                <span className="text-muted-foreground">Automated scraping or abuse of the service is prohibited.</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">No Warranty</h2>
            <p className="text-muted-foreground">QuickShed tools are provided <strong className="text-foreground">as-is</strong>. While we strive for accuracy, results should be verified independently for critical use cases. QuickShed is not liable for errors in tool output.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Intellectual Property</h2>
            <p className="text-muted-foreground">The QuickShed name, logo, and design are proprietary. Tool implementations are original works. You retain all rights to any data you process using our tools.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3 text-foreground">Changes to Terms</h2>
            <p className="text-muted-foreground">We may update these terms occasionally. Continued use of QuickShed after changes constitutes acceptance of the updated terms.</p>
          </div>

          <div className="pt-4 border-t border-border/50">
            <h2 className="text-xl font-semibold mb-3 text-foreground">Contact</h2>
            <p className="text-muted-foreground">Questions about these terms? Reach us via our <a href="https://github.com/quickshed" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">GitHub</a> page.</p>
          </div>
        </section>
      </div>
    </main>
  );
}

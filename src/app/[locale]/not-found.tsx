import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mb-6">
        <FileQuestion className="size-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-foreground mb-3">404</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        This page doesn&apos;t exist. It might have been moved or deleted.
      </p>
      <Link
        href="/en"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-500/20"
      >
        Back to QuickShed
      </Link>
    </div>
  );
}

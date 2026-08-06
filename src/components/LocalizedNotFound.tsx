import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import en from '../../messages/en.json';
import ar from '../../messages/ar.json';

export default function LocalizedNotFound() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center"
    >
      <div className="flex size-20 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 mb-6">
        <FileQuestion className="size-10" aria-hidden="true" />
      </div>
      <h1 className="text-4xl font-extrabold text-foreground mb-3">404</h1>
      <p lang="en" className="localized-not-found-en text-lg text-muted-foreground mb-8 max-w-md">
        {en.common.pageNotFoundDescription}
      </p>
      <p lang="ar" className="localized-not-found-ar text-lg text-muted-foreground mb-8 max-w-md">
        {ar.common.pageNotFoundDescription}
      </p>
      <Link
        href="/en"
        lang="en"
        className="localized-not-found-link-en inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-500/20"
      >
        {en.common.backToQuickShed}
      </Link>
      <Link
        href="/ar"
        lang="ar"
        className="localized-not-found-link-ar inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-500/20"
      >
        {ar.common.backToQuickShed}
      </Link>
    </div>
  );
}

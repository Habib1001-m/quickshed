import type { Metadata, Viewport } from 'next';
import { SITE_URL } from '@/lib/site-config';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'QuickShed - Your Instant Privacy-First Toolbox',
    template: '%s | QuickShed',
  },
  description:
    'Free, privacy-respecting web toolbox with 90+ tools that run entirely in your browser. No accounts. No ads. Your data stays on your device.',
  manifest: '/manifest.json',
  keywords: [
    'QuickShed', 'online tools', 'privacy', 'free tools', 'calculator',
    'converter', 'text tools', 'PDF tools', 'developer tools',
    'Arabic', 'English', 'صندوق أدوات', 'أدوات مجانية', 'أدوات خصوصية',
  ],
  authors: [{ name: 'QuickShed' }],
  openGraph: {
    title: 'QuickShed - Your Instant Privacy-First Toolbox',
    description: 'Free, privacy-respecting web toolbox with 90+ tools that run entirely in your browser.',
    siteName: 'QuickShed',
    type: 'website',
    url: SITE_URL,
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickShed - Your Instant Privacy-First Toolbox',
    description: 'Free, privacy-respecting web toolbox with 90+ tools that run entirely in your browser.',
    images: ['/og-image.png'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

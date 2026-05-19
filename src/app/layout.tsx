import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://quickshed.com"),
  title: "QuickShed - Your Instant Privacy-First Toolbox",
  description:
    "Free, privacy-respecting web toolbox with 90+ tools that run entirely in your browser. No accounts. No ads. Your data stays on your device.",
  manifest: "/manifest.json",
  keywords: [
    "QuickShed",
    "online tools",
    "privacy",
    "free tools",
    "calculator",
    "converter",
    "text tools",
    "PDF tools",
    "developer tools",
    "Arabic",
    "English",
    "صندوق أدوات",
    "أدوات مجانية",
    "أدوات خصوصية",
  ],
  authors: [{ name: "QuickShed" }],
  openGraph: {
    title: "QuickShed - Your Instant Privacy-First Toolbox",
    description:
      "Free, privacy-respecting web toolbox with 90+ tools that run entirely in your browser.",
    siteName: "QuickShed",
    type: "website",
    url: "https://quickshed.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuickShed - Your Instant Privacy-First Toolbox",
    description:
      "Free, privacy-respecting web toolbox with 90+ tools that run entirely in your browser.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://quickshed.com",
    languages: {
      "en": "https://quickshed.com",
      "ar": "https://quickshed.com",
    },
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} ${tajawal.variable} antialiased bg-background text-foreground`}
        style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

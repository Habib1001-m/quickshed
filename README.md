<div align="center">

# ⚡ QuickShed

### Your Instant Privacy-First Toolbox

**90+ free tools that run entirely in your browser. No accounts. No ads. Your data stays on your device.**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://quickshed.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-blue?style=for-the-badge&logo=github)](https://github.com/Habib1001-m/quickshed)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[🌐 English](https://quickshed.vercel.app/en) | [🇸🇦 العربية](https://quickshed.vercel.app/ar)

</div>

---

## 🌟 Why QuickShed?

| Feature | QuickShed | Other Online Tools |
|---------|-----------|-------------------|
| 🔒 Privacy | 100% client-side | Sends data to servers |
| 💰 Price | Free forever | Freemium / Ads |
| 🌍 Languages | Arabic + English | English only |
| 📱 PWA | Installable web app | Browser only |
| 🎨 Themes | Dark/Light + accent colors | Limited |
| 📦 Tools | 90+ in one place | Scattered across sites |
| 🚫 Ads | Zero | Banner / Popup ads |
| 🔄 Offline | Service Worker cache | No offline support |

---

## 🛠️ Categories

| # | Category | Tools | Examples |
|---|----------|-------|---------|
| 1 | 🧮 **Calculators** | 13 | BMI, Compound Interest, Loan, Age, GPA |
| 2 | ⏰ **Time Tools** | 9 | Date Adder, Alarm Creator, Countdown, Stopwatch |
| 3 | 📝 **Text Tools** | 10 | Case Converter, Slug Generator, Line Sorter, Word Counter |
| 4 | 🔄 **Converters** | 7 | Color Converter, Unit Converter, Number Base, Temperature |
| 5 | 🎓 **Student Tools** | 10 | GPA Calculator, Citation Generator, Plagiarism Checker |
| 6 | 📄 **PDF Tools** | 5 | PDF Merger, Page Remover, Rotate, Watermark |
| 7 | 🔧 **Utility Tools** | 15 | Password Generator, QR Code, UUID Generator, JSON Formatter |
| 8 | 🔍 **SEO Tools** | 5 | Meta Tag Generator, Robots.txt Creator, Sitemap Generator |
| 9 | 💻 **Developer Tools** | 8 | JSON Formatter, Base64 Encoder, Regex Tester, Hash Generator |
| 10 | 🖼️ **Image Tools** | 4 | Image Format Converter, Resizer, Compressor |
| 11 | 🔐 **Security Tools** | 4 | Password Generator, Password Strength, Encryption/Decryption |

---

## ✨ Key Features

### 🔒 Privacy First
Every tool runs 100% in your browser using Web APIs. No data is ever sent to a server. Your files, texts, and calculations never leave your device.

### 🌐 Bilingual (Arabic + English)
Full RTL support with complete Arabic translations. Switch languages instantly with a single click. All 90+ tools are fully translated.

### 📱 PWA Support
Install QuickShed on your device like a native app. Works offline with Service Worker caching. Get the app-like experience without the app store.

### 🎨 Beautiful UX
- **Dark/Light Mode** with system preference detection
- **Accent Color Customization** — choose from 8+ theme colors
- **Smooth Animations** powered by Framer Motion
- **Interactive Onboarding Tour** for new users
- **Keyboard Shortcuts** for power users (`Ctrl+K` for search)
- **Tool History Timeline** — revisit recently used tools
- **Favorites System** — bookmark your go-to tools
- **Smart Recommendations** — personalized tool suggestions

---

## 🧩 Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ React 19 │ │ Zustand  │ │ Service      │ │
│  │ + RSC    │ │ Store    │ │ Worker (PWA) │ │
│  └────┬─────┘ └────┬─────┘ └──────────────┘ │
│       │             │                        │
│  ┌────▼─────────────▼─────┐                  │
│  │    Next.js 16 (SSG)    │                  │
│  │  ┌───────────────────┐ │                  │
│  │  │ App Router + RSC  │ │                  │
│  │  │ [locale] routing  │ │                  │
│  │  └───────────────────┘ │                  │
│  └────────────────────────┘                  │
│         ▲ Static HTML (Vercel Edge)          │
└─────────┼───────────────────────────────────┘
          │
    ┌─────▼─────┐
    │  Vercel    │
    │  CDN/Edge  │
    └───────────┘
```

**Key Architectural Decisions:**
- **SSG (Static Site Generation)** — All pages pre-rendered at build time for maximum performance
- **No Server Required** — Zero API routes, zero database, zero server costs
- **Client-Side Only Tools** — All 90+ tools use Web APIs (Canvas, Crypto, File, etc.)
- **On-Demand Tool Loading** — Tools loaded lazily via dynamic imports for fast initial page load

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Habib1001-m/quickshed.git
cd quickshed

# Install dependencies
bun install

# Start development server
bun run dev

# Open in browser
open http://localhost:3000
```

### Build for Production

```bash
# Create optimized production build
bun run build

# Run linting
bun run lint
```

---

## 📁 Project Structure

```
quickshed/
├── public/
│   ├── favicon.ico              # Browser tab icon
│   ├── icon-192.png             # PWA icon (192×192)
│   ├── icon-512.png             # PWA icon (512×512)
│   ├── og-image.png             # Social sharing image
│   └── sw.js                    # Service Worker (caching)
├── src/
│   ├── app/
│   │   ├── [locale]/            # Dynamic locale routing (en/ar)
│   │   │   ├── page.tsx         # Home page (hero + categories + tools)
│   │   │   ├── layout.tsx       # Root layout with theme + i18n
│   │   │   ├── category/
│   │   │   │   ├── page.tsx     # All categories listing
│   │   │   │   └── [slug]/      # Individual category page
│   │   │   ├── tools/[slug]/    # Individual tool page
│   │   │   ├── all-tools/       # Complete tools listing
│   │   │   ├── favorites/       # User favorites
│   │   │   ├── privacy/         # Privacy policy
│   │   │   └── terms/           # Terms of service
│   │   ├── icon.png             # Next.js favicon
│   │   ├── robots.ts            # Dynamic robots.txt
│   │   ├── sitemap.ts           # Dynamic sitemap.xml
│   │   └── opengraph-image.tsx  # Dynamic OG image
│   ├── components/
│   │   ├── ui/                  # shadcn/ui component library
│   │   ├── tools/               # 90+ tool components
│   │   │   ├── PasswordGenerator.tsx
│   │   │   ├── JsonFormatter.tsx
│   │   │   ├── ColorConverter.tsx
│   │   │   └── ...              # 87 more tools
│   │   ├── views/               # Page view components
│   │   │   ├── HomeView.tsx
│   │   │   ├── ToolView.tsx
│   │   │   ├── CategoryView.tsx
│   │   │   └── ...
│   │   ├── Footer.tsx           # Site footer
│   │   ├── Header.tsx           # Navigation header
│   │   ├── CommandPalette.tsx   # Ctrl+K search
│   │   ├── OnboardingTour.tsx   # Interactive tour
│   │   ├── ThemeCustomizer.tsx  # Color themes
│   │   └── ...
│   └── lib/
│       ├── i18n.ts              # Internationalization system
│       ├── store.ts             # Zustand global state
│       ├── tool-utils.ts        # Tool definitions & helpers
│       ├── category-config.ts   # Category metadata & colors
│       ├── ssr-locale.tsx       # SSR locale context
│       └── onboarding-steps.ts  # Onboarding configuration
├── messages/
│   ├── en.json                  # English translations (400+ keys)
│   └── ar.json                  # Arabic translations (400+ keys)
├── content/
│   └── tools-index.json         # Tool metadata index
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies & scripts
```

---

## 🧩 Adding a New Tool

1. **Create the tool component** in `src/components/tools/`:

```tsx
'use client';
import { useI18n } from '@/lib/i18n';

export default function MyNewTool() {
  const { t, locale } = useI18n();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('myNewTool.title')}</h2>
      {/* Tool UI here */}
    </div>
  );
}
```

2. **Register the tool** in `content/tools-index.json`:

```json
{
  "id": "my-new-tool",
  "name": "My New Tool",
  "nameAr": "أداتي الجديدة",
  "category": "utility-tools",
  "icon": "Wrench",
  "description": "Does something useful",
  "descriptionAr": "يقوم بشيء مفيد"
}
```

3. **Add translations** in `messages/en.json` and `messages/ar.json`:

```json
{
  "myNewTool": {
    "title": "My New Tool",
    "description": "Does something useful"
  }
}
```

4. **Add lazy loader** in `src/components/tools/index.ts`:

```ts
case 'my-new-tool':
  mod = import('./MyNewTool');
  break;
```

That's it! The tool will automatically appear in the correct category.

---

## 🔐 Security

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | Strict CSP with nonce support |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

- **No cookies** — All preferences stored in `localStorage`
- **No tracking** — Zero analytics, zero third-party scripts
- **No server** — All processing happens in the browser
- **CSP compliant** — Strict Content Security Policy prevents XSS

---

## 🌐 SEO

| Feature | Implementation |
|---------|---------------|
| `sitemap.xml` | Dynamic generation via `src/app/sitemap.ts` |
| `robots.txt` | Dynamic generation via `src/app/robots.ts` |
| Schema Markup | JSON-LD (WebSite + SearchAction) |
| Open Graph | Dynamic OG image via `src/app/opengraph-image.tsx` |
| Twitter Cards | Large image summary with meta tags |
| Canonical URLs | Locale-aware canonical URLs |
| SSR Content | Server-rendered content for crawlers |

---

## 🎯 Technology Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Next.js** | React Framework (App Router + SSG) | 16 |
| **TypeScript** | Type-safe JavaScript | 5 |
| **React** | UI Library | 19 |
| **Tailwind CSS** | Utility-first CSS | 4 |
| **shadcn/ui** | Component Library (New York) | Latest |
| **Zustand** | Client State Management | 5 |
| **TanStack Query** | Server State Management | 5 |
| **Framer Motion** | Animations & Transitions | 12 |
| **Lucide React** | Icon Library | Latest |
| **next-themes** | Dark/Light Mode | 0.4 |
| **pdf-lib** | PDF Manipulation | 1.17 |
| **recharts** | Data Visualization | 2 |
| **fuse.js** | Fuzzy Search | 7 |
| **sharp** | Image Processing | 0.34 |
| **date-fns** | Date Utilities | 4 |
| **zod** | Schema Validation | 4 |
| **Vercel** | Deployment & CDN | — |

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m 'Add my feature'`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Guidelines
- Follow the existing code style (TypeScript strict mode)
- Add translations for both English and Arabic
- Test in both LTR and RTL layouts
- Ensure all tools work client-side only (no server dependencies)
- Run `bun run lint` before submitting

---

<div align="center">

**Built with ❤️ by [Habib](https://github.com/Habib1001-m)**

[⬆ Back to Top](#-quickshed)

</div>

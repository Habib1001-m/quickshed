<div align="center">

# ⚡ QuickShed

### Your Instant Privacy-First Toolbox

**90 free tools that run entirely in your browser. No accounts. No ads. Tool inputs stay on your device.**

Current release target: **v0.6.0**.

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
| 📦 Tools | 90 in one place | Scattered across sites |
| 🚫 Ads | Zero | Banner / Popup ads |
| 🔄 Offline | Static-asset Service Worker cache | No offline support |

---

## 🛠️ Categories

| # | Category | Tools | Examples |
|---|----------|-------|---------|
| 1 | 🧮 **Calculators** | 13 | Compound Interest, Basic, Loan, Fuel Cost, GPA |
| 2 | ⏰ **Time Tools** | 9 | Date Adder, Alarm Creator, Unix Timestamp, Stopwatch, Work Hours |
| 3 | 📝 **Text Tools** | 10 | Cursive Text, Slug, Markdown to HTML, Case Converter, Remove Duplicates |
| 4 | 🔄 **Converters** | 7 | Speed, Length, Number Base, Temperature, Color |
| 5 | 🎓 **Student Tools** | 10 | Plagiarism, Flashcard Maker, Essay Word Counter, Note Organizer, Reading Time |
| 6 | 📄 **PDF Tools** | 5 | Page Remover, Merger, PDF to Text, Watermark, Rotate |
| 7 | 🔧 **Utility Tools** | 15 | Password, Line Sorter, Whitespace Remover, Random Number, Morse Code |
| 8 | 🔍 **SEO Tools** | 5 | Robots.txt, Meta Tag, SERP, Open Graph Debugger, Keyword Density |
| 9 | 💻 **Developer Tools** | 8 | Hash, SQL Formatter, JWT Decoder, Base64, HTML Beautifier |
| 10 | 🖼️ **Image Tools** | 4 | Image Format, Resizer, Cropper, Color Palette Extractor |
| 11 | 🔐 **Security Tools** | 4 | SSL Certificate Parser, Random Password, URL Encoder, Password Strength |

---

## ✨ Key Features

### 🔒 Privacy First
Tool inputs and files are processed in your browser and are not sent by the application. The hosting provider still receives the page request needed to serve the site; host-level access-log handling is outside this repository.

### 🌐 Bilingual (Arabic + English)
Full RTL support with complete Arabic translations. Switch languages instantly with a single click. All 90 tools are fully translated.

### 📱 PWA Support
Install QuickShed on your device like a native app. The Service Worker caches selected static assets after they load; a cold offline visit is not guaranteed.

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
- **No App Backend** — Zero API routes and zero database
- **Client-Side Only Tools** — All 90 tools use Web APIs (Canvas, Crypto, File, etc.)
- **On-Demand Tool Loading** — Tools loaded lazily via dynamic imports for fast initial page load
- **Localized 404 fallback** — `src/app/[locale]/[...path]/page.tsx` is an intentional error-only dynamic route for unknown locale-prefixed paths; known pages remain statically generated.

## 🛡️ Tool Metadata and Privacy Contract

QuickShed currently has **90 tool definitions** across 11 categories and 90
matching runtime index entries. The index is not an additional tool. Each tool
declares its bilingual identity, route, component, inputs and outputs, privacy
class, offline availability, retention, risk level, and data-flow evidence.

The contributor-facing contract, enum meanings, validation workflow, disclosure
UX, and count-reconciliation policy are documented in
[Tool Metadata and Privacy Contract](docs/tool-metadata-contract.md).
Run `npm run check:tool-count` to reconcile the source count and reject stale
product or communication claims that count the runtime index as a tool.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22 for CI parity
- npm 10.9.8 for installs and release checks
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/Habib1001-m/quickshed.git
cd quickshed

# Install dependencies
npm ci

# Start development server
npm run dev

# Open in browser
open http://127.0.0.1:7125
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Run linting
npm run lint

# Run the full release gate
npm run release:check

# Optional full browser smoke suite, after installing all Playwright browsers
npx playwright install
npm run test:e2e:all
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
│   │   └── sitemap.ts           # Dynamic sitemap.xml generation
│   ├── components/
│   │   ├── ui/                  # shadcn/ui component library
│   │   ├── tools/               # 90 tool components
│   │   │   ├── PasswordGenerator.tsx
│   │   │   ├── JsonFormatter.tsx
│   │   │   ├── ColorConverter.tsx
│   │   │   └── ...              # 87 more tools
│   │   ├── views/               # Page view components
│   │   │   ├── HomeView.tsx
│   │   │   ├── ToolView.tsx
│   │   │   ├── CategoryView.tsx
│   │   │   └── ...
│   │   ├── layout/Footer.tsx    # Site footer
│   │   ├── layout/Header.tsx    # Navigation header
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
│   ├── en.json                  # English translations (320 keys)
│   └── ar.json                  # Arabic translations (320 keys)
├── content/
│   └── tools-index.json         # Tool metadata index
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies & scripts
```

---

## 🧩 Working with Tool Metadata

Tool metadata changes are governed by the [Tool Metadata and Privacy
Contract](docs/tool-metadata-contract.md). Update the source definition under
`content/tools/`, keep `content/tools-index.json` in parity, and resolve the
declared component through `src/components/tools/index.ts`. The full contract
also requires bilingual identity and descriptions, declared inputs and outputs,
privacy/offline/retention/risk values, and checkable data-flow evidence.

Tool inventory changes are separately scoped and require owner approval. For an
approved metadata or disclosure change, run the focused validation commands in
the contract document before running `npm run release:check`.

---

## 🔐 Security

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | Restrictive same-origin policy with explicit object, base, form, and frame restrictions |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

- **No tracking cookies** — Preferences and tool data use `localStorage`; the Service Worker may use `Cache Storage` for selected static assets after they load
- **No tracking** — Zero analytics, zero third-party scripts
- **No app backend** — Tool processing happens in the browser; the static host still serves page requests
- **Browser security headers** — CSP, frame protection, content-type protection, referrer policy, and reduced permissions are configured in `next.config.ts`

---

## 🌐 SEO

| Feature | Implementation |
|---------|---------------|
| `sitemap.xml` | Dynamic generation via `src/app/sitemap.ts` |
| `robots.txt` | Dynamic generation via `src/app/robots.ts` |
| Schema Markup | JSON-LD (WebSite + SearchAction) |
| Open Graph | Locale/page metadata with `public/og-image.png` |
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
| **Framer Motion** | Animations & Transitions | 12 |
| **Lucide React** | Icon Library | Latest |
| **next-themes** | Dark/Light Mode | 0.4 |
| **pdf-lib** | PDF Manipulation | 1.17 |
| **fuse.js** | Fuzzy Search | 7 |
| **sharp** | Image Processing | 0.35 |
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
- Run `npm run release:check` before submitting

---

<div align="center">

**Built with ❤️ by [Habib](https://github.com/Habib1001-m)**

[⬆ Back to Top](#-quickshed)

</div>

# QuickShed - Your Instant Privacy-First Toolbox

A privacy-first, bilingual (Arabic/English) web toolbox with 90+ tools that run entirely client-side. No data leaves your browser.

## Features

- **90+ Local Tools** across 11 categories: Calculators, Converters, Text, Dev, Security, Image, Time, Generators, Encoders, PDF, and more
- **Full Arabic/English Support** with RTL layout and complete translations
- **Dark/Light Mode** with accent color customization
- **PWA Support** with manifest and service worker
- **Interactive Onboarding Tour** for new users
- **Keyboard Shortcuts** for power users
- **Tool History & Favorites** for quick access
- **Privacy-First**: All tools run client-side only — zero data collection

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand + TanStack Query
- **i18n**: Custom bilingual system (Arabic/English)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel (SSG)

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build

# Run linter
bun run lint
```

## Project Structure

```
src/
├── app/
│   └── [locale]/          # Dynamic locale routing (en/ar)
│       ├── page.tsx        # Home page
│       ├── category/       # Category pages
│       ├── tools/          # Individual tool pages
│       ├── all-tools/      # All tools listing
│       ├── favorites/      # User favorites
│       ├── privacy/        # Privacy policy
│       └── terms/          # Terms of service
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── tools/              # 90+ tool components
│   └── views/              # Page view components
├── lib/
│   ├── i18n.ts             # Internationalization
│   ├── store.ts            # Zustand store
│   └── tool-utils.ts       # Tool utilities
└── messages/
    ├── en.json             # English translations
    └── ar.json             # Arabic translations
```

## License

MIT

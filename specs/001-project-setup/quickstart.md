# Quickstart: BE-01 프로젝트 초기 세팅

**Branch**: `001-project-setup` | **Date**: 2026-02-27
**Estimated Time**: 15–20 minutes

## Prerequisites

- Node.js >= 18 installed (`node --version` should show v18+)
- npm >= 9 installed
- Git configured
- Google AI Studio API key (get from https://aistudio.google.com/app/apikey)

## Step 1: Create the Next.js Project

```bash
npx create-next-app@latest lifepath \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd lifepath
```

Answer prompts:
- "Would you like to use Turbopack?" → **No** (for stability)

## Step 2: Initialize shadcn/ui

```bash
npx shadcn@latest init
```

Answer prompts:
- Style: **Default**
- Base color: **Slate**
- CSS variables: **Yes**

## Step 3: Install Initial shadcn/ui Components

```bash
npx shadcn@latest add button input card
```

## Step 4: Install Core Dependencies

```bash
# React Flow v12 (IMPORTANT: use @xyflow/react, NOT the legacy reactflow package)
npm install @xyflow/react @dagrejs/dagre

# State management
npm install zustand

# Dark mode support
npm install next-themes
```

## Step 5: Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your Gemini API key:
```
GEMINI_API_KEY=your_actual_api_key_here
USE_MOCK=false
```

## Step 6: Create Directory Structure

```bash
mkdir -p types data store
touch types/index.ts data/.gitkeep store/usePathStore.ts
```

## Step 7: Configure Root Layout (Dark Mode)

Update `app/layout.tsx` to include ThemeProvider and React Flow CSS:

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import '@xyflow/react/dist/style.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LifePath',
  description: 'AI-powered life path navigator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Step 8: Verify Installation

```bash
# Start dev server
npm run dev
```

Open http://localhost:3000 — you should see the default Next.js page.

```bash
# Type check
npx tsc --noEmit
```

Should report zero errors.

## Step 9: Smoke Test shadcn/ui

Add to `app/page.tsx`:
```tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Input placeholder="Enter your goal..." className="w-96" />
      <Button>Generate Path</Button>
    </main>
  );
}
```

The page should render a dark-themed input and button.

## Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads
- [ ] `npx tsc --noEmit` reports 0 errors
- [ ] `Button` and `Input` from shadcn/ui render with dark theme
- [ ] `@xyflow/react` package is in `node_modules` (NOT `reactflow`)
- [ ] `@dagrejs/dagre` package is in `node_modules`
- [ ] `zustand` package is in `node_modules`
- [ ] `.env.local` exists and is NOT committed (check `git status`)
- [ ] `.env.example` is tracked by git (`git status` shows it)
- [ ] Directories `types/`, `data/`, `store/` exist at project root

## Troubleshooting

**"Cannot find module '@xyflow/react'"**
→ Run `npm install @xyflow/react` — do NOT install `reactflow`

**"Module not found: Can't resolve '@/components/ui/button'"**
→ Ensure `components.json` exists and run `npx shadcn@latest add button`

**"Tailwind styles not applying"**
→ Check `tailwind.config.ts` content paths include `./app/**/*.{ts,tsx}` and `./components/**/*.{ts,tsx}`

**Dark mode not working**
→ Ensure `ThemeProvider` has `defaultTheme="dark"` and `attribute="class"` in `app/layout.tsx`

**TypeScript error on Zustand store**
→ Ensure `"strict": true` is in `tsconfig.json` and use the `create<StoreType>()()` double-call pattern

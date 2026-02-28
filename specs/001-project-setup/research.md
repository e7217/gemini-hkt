# Research: BE-01 프로젝트 초기 세팅

**Branch**: `001-project-setup` | **Date**: 2026-02-27

## 1. Package Version Research

### Next.js 14+ App Router
- **Latest stable**: Next.js 14.2.x (LTS) — use `create-next-app@latest` which defaults to 14+
- **App Router**: Enabled by default in Next.js 13.4+; no additional configuration needed
- **TypeScript**: First-class support; `create-next-app` auto-generates `tsconfig.json`
- **Key config**: `next.config.ts` (TypeScript config file supported in Next.js 14+)

### Tailwind CSS + shadcn/ui
- **Tailwind CSS**: v3.x (shadcn/ui requires Tailwind CSS v3; v4 not yet supported by shadcn/ui as of Feb 2026)
- **shadcn/ui initialization**: `npx shadcn@latest init` — sets up `components.json`, updates `globals.css`, configures `tailwind.config.ts`
- **Dark mode strategy**: Class-based (`darkMode: ["class"]` in `tailwind.config.ts`) — required for `next-themes` integration
- **Default theme**: `dark` via `ThemeProvider` from `next-themes` in root `layout.tsx`
- **CSS Variables**: shadcn/ui uses HSL CSS variables (`--background`, `--foreground`, etc.) for theming
- **Required shadcn/ui components for this phase**: `button`, `input`, `card` (minimum for goal input UI)

### @xyflow/react v12
- **Package**: `@xyflow/react` (NOT `reactflow` — different package, React Flow v12 migrated to `@xyflow/react`)
- **Breaking change**: v12 uses `@xyflow/react`, the `reactflow` package is legacy (v11)
- **CSS import**: Must import `@xyflow/react/dist/style.css` in the root layout or page
- **React requirement**: React 18+ (compatible with Next.js 14)
- **TypeScript**: Built-in TypeScript types in `@xyflow/react`

### @dagrejs/dagre
- **Package**: `@dagrejs/dagre` (NOT `dagre` — `@dagrejs/dagre` is the maintained fork)
- **TypeScript types**: `@types/dagre` may be needed, or use `@dagrejs/dagre` built-in types
- **Usage pattern**:
  ```typescript
  import dagre from '@dagrejs/dagre';
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'BT' }); // Bottom-to-Top for LifePath vertical tree
  ```
- **Layout direction**: `rankdir: 'BT'` (Bottom-to-Top) for LifePath's "현재 → 목표" upward tree

### Zustand
- **Latest**: Zustand 4.x (stable, TypeScript-first)
- **Recommended pattern for Next.js**: Use `createStore` with `zustand/react` for SSR-safe usage
- **Basic store pattern**:
  ```typescript
  import { create } from 'zustand';
  interface PathStore {
    goal: string;
    setGoal: (goal: string) => void;
  }
  export const usePathStore = create<PathStore>()((set) => ({
    goal: '',
    setGoal: (goal) => set({ goal }),
  }));
  ```

## 2. Configuration Details

### tsconfig.json key settings
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "paths": { "@/*": ["./*"] },
    "moduleResolution": "bundler",
    "jsx": "preserve"
  }
}
```

### tailwind.config.ts key settings
```typescript
import type { Config } from 'tailwindcss';
const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  // shadcn/ui extends theme here via 'extend'
};
```

### components.json (shadcn/ui)
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": { "config": "tailwind.config.ts", "css": "app/globals.css", "baseColor": "slate", "cssVariables": true },
  "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui" }
}
```

### .env.example
```
# Gemini API Key (required for path generation)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Set to 'true' to use mock data instead of live API
USE_MOCK=false
```

## 3. Installation Command Sequence

```bash
# 1. Create Next.js project
npx create-next-app@latest lifepath \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"

cd lifepath

# 2. Initialize shadcn/ui
npx shadcn@latest init

# 3. Install initial shadcn/ui components
npx shadcn@latest add button input card

# 4. Install React Flow v12 + dagre
npm install @xyflow/react @dagrejs/dagre

# 5. Install Zustand
npm install zustand

# 6. Install next-themes for dark mode
npm install next-themes

# 7. Create directory structure
mkdir -p components/ui lib types data store
```

## 4. Known Incompatibilities & Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Using `reactflow` (v11) instead of `@xyflow/react` (v12) | HIGH | Always import from `@xyflow/react`; add `"reactflow": "forbidden"` note to README |
| Tailwind CSS v4 breaking shadcn/ui | MEDIUM | Pin `tailwindcss` to `^3.4.0` in package.json until shadcn/ui v4 support confirmed |
| dagre TypeScript types mismatch | LOW | Use `@dagrejs/dagre` which has updated types; add `@types/dagre` as fallback |
| Zustand SSR hydration mismatch in Next.js | LOW | Use client components (`"use client"`) for all Zustand-consuming components |
| React Flow CSS not imported | MEDIUM | Import `@xyflow/react/dist/style.css` in `app/layout.tsx` |

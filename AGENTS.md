# AGENTS.md — Timekeeper

Guidance for agentic coding agents operating in this repository.

---

## Project Overview

Timekeeper is a desktop app built with **SolidJS + TypeScript** on the frontend and **Tauri (Rust)** on the backend. It is a time-tracking tool that persists data via Tauri's file-backed store plugin.

Tech stack: SolidJS, TypeScript, Vite, Tailwind CSS, Tauri, dayjs, `@solidjs/router`.

---

## Build / Dev / Lint Commands

```bash
# Start Vite dev server (port 1420, required by Tauri)
npm run dev

# Build production frontend bundle
npm run build

# Preview production build
npm run serve

# Run Tauri app in development mode (requires Rust toolchain)
npx tauri dev

# Build full Tauri desktop app
npx tauri build

# Lint: ESLint over src/, *.js, *.ts
npm run lint

# Type-check without emitting
npm run typecheck
```

### Testing

**There is no test suite.** No test runner (Vitest, Jest, etc.) is configured and there are no test files. If you add tests, use **Vitest** (compatible with the existing Vite setup). A single Vitest test can be run with:

```bash
npx vitest run src/path/to/file.test.ts
```

---

## Code Style

### TypeScript

- **Strict mode** is enabled: `strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
- **No `any`** — use explicit types everywhere.
- `jsxImportSource` is `solid-js`; do not change JSX transform settings.
- `isolatedModules: true` — every file must be a module (has at least one `import`/`export`).
- `allowImportingTsExtensions: true` — `.ts`/`.tsx` extensions are allowed in import paths.
- Use the `type` keyword inline for type-only named imports:
  ```ts
  import { type Component, For, Show } from "solid-js";
  ```
- Use `@ts-expect-error` (not `@ts-ignore`) and always include an explanatory comment.
- `@ts-nocheck` is acceptable only as a last resort with a comment explaining why.
- Non-null assertion `!` is acceptable when the developer is certain a value is set.

### Imports

- External/third-party imports first, then internal relative imports.
- Always import `dayjs` from the local wrapper `../../dayjs` (or the correct relative path to `src/dayjs.ts`), **never** directly from `"dayjs"`. This ensures plugins are always loaded.
- Import components from the barrel export `../../components` (not individual files).
- Pages are **not** barrel-exported — import them by direct path.

### Naming Conventions

| Entity                        | Convention                  | Example                              |
| ----------------------------- | --------------------------- | ------------------------------------ |
| Components                    | PascalCase                  | `BookingRow`, `AnrAddRow`            |
| Functions/helpers             | camelCase                   | `getBookingsForDay`, `formatCsv`     |
| Types                         | PascalCase                  | `Booking`, `AppState`, `Settings`    |
| Module-level string constants | SCREAMING_SNAKE_CASE        | `const IGNORE = "ignore"`            |
| Component files               | PascalCase                  | `Button.tsx`, `Layout.tsx`           |
| Non-component modules         | lowercase                   | `store.ts`, `storage.ts`, `dayjs.ts` |
| Page directories              | PascalCase with `index.tsx` | `pages/Booking/index.tsx`            |

### Component Patterns (SolidJS)

- Type components as `Component` or `ParentComponent` from `solid-js`.
- Arrow functions are preferred for components; `function` declarations are acceptable.
- Props typed inline as generics:
  ```ts
  const BookingRow: Component<{ date: Dayjs }> = (props) => { ... };
  ```
- Use SolidJS `classList` for conditional class application — **never** string concatenation or template literals for class names.
- Use `createEffect` for reactive side effects and storage sync.
- Use `For` and `Show` SolidJS primitives instead of `.map()` and ternaries where appropriate.

### CSS / Tailwind

- Tailwind utility classes used inline in JSX.
- Custom component classes (`.btn`, `.btn-primary`, `.input`, `.select`, `.box`, `.dialog`, `.link`) are defined in `src/styles.css` under `@layer components`. Use these rather than re-implementing with raw utilities.
- `classList` (SolidJS reactive binding) for conditional styles — never template string class concatenation.
- CSS animations defined with `@keyframes` in `styles.css`.

### Types

- Define types as `type` aliases (not `interface`).
- Export types alongside values using the inline `type` keyword:
  ```ts
  export { myValue, type MyType };
  ```
- Types live close to where they are used; shared types can be exported from `store.ts`.

### Error Handling

- No `try/catch` blocks are currently used — Tauri store API errors are not explicitly caught. Follow this pattern unless error handling is specifically needed.
- Form validation uses native HTML constraints (`required`, `pattern`, `min`).
- Helper functions return `null` on invalid/missing input rather than throwing.

---

## Architecture

### State Management

- Single global SolidJS store (`createStore`) in `src/store.ts`, exported as `state` / `setState`.
- Top-level `await` initializes state from persistent storage at module load time.
- State mutation functions are named exports from `store.ts` (act like action creators).
- `createEffect` syncs in-memory state to Tauri persistent storage (write-through).

### Persistence

- `tauri-plugin-store-api` (`Store` class) provides file-backed JSON storage.
- Three stores: `settings.json`, `{currentYear}.json`, `{previousYear}.json`.
- Data keyed by `month/{index}` inside year-stores; values are `Booking[][][]`.

### Routing

- `@solidjs/router` with two routes: `/` → Booking page, `/settings` → Settings page.
- `Layout` is the persistent shell, passed as `root` to `Router`.

### File Organization

```
src/
  components/     # Reusable UI primitives; all re-exported from index.tsx
  pages/          # Page-level feature components (directory per page, index.tsx inside)
  utils/          # Pure utility functions, no side effects
  store.ts        # Single global state module
  storage.ts      # Tauri store instances (infrastructure only)
  dayjs.ts        # Configured dayjs singleton (always import from here)
```

### Key Domain Details

- `IGNORE` sentinel string marks non-working days; entries with this value are excluded from CSV exports and hour calculations.
- Form data extracted with native `FormData` API using array-named inputs (`hours[]`, `anr[]`, `description[]`).
- `dayjs` (with `isoWeek` and `weekday` plugins) is used for all date logic.

---

## Linting

ESLint with `@typescript-eslint/recommended` + Prettier integration:

- Prettier runs as an ESLint rule (`prettier/prettier: "error"`). Violations are lint errors.
- Prettier defaults apply (double quotes, semicolons, 80-char print width, trailing commas).
- Disable rules sparingly with `// eslint-disable-next-line` and always add a comment explaining why.
- `console.log` is currently left in production code (store effects log state changes). This is acceptable but be mindful of adding noise.

---

## Miscellaneous

- `mise.toml` manages Node and Rust toolchain versions. Use `mise install` to set up the environment.
- The Vite dev server is hardcoded to port `1420` (`strictPort: true`) — this is a Tauri requirement; do not change it.
- `src/components/index.tsx` is a barrel file — add new generic components there and export from it.
- Pages are **not** barrel-exported; `App.tsx` imports them directly by path.
- There are no AI assistant rules files (`.cursorrules`, `.github/copilot-instructions.md`) in this repo.

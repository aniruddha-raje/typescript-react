# typescript-react

A small **React 19 + TypeScript + Vite** app that demonstrates **React Router**
and **Redux Toolkit** working together: a mock login guarding two demo pages,
one shared store, and a status bar that proves the state survives every route
change.

The code is written to be read — most files carry a short comment explaining
*why* the pattern is there, not just what it does.

---

## Quick start

```bash
npm install
npm run dev
```

The dev server runs at <http://localhost:5173>. The demo pages are behind a
mock login — sign in with **`admin` / `admin`**.

| Script            | What it does                                                        |
| ----------------- | ------------------------------------------------------------------- |
| `npm run dev`     | Vite dev server with hot module replacement                          |
| `npm run build`   | `tsc -b && vite build` — typechecks first, then bundles into `dist/` |
| `npm run lint`    | ESLint across every `.ts` / `.tsx` file                              |
| `npm run preview` | Serves the built `dist/` locally, to sanity-check a production build |

---

## Project structure

```
typescript-react/
├── index.html              Vite's entry HTML — mounts #root, loads src/main.tsx
├── package.json            Dependencies and the four npm scripts
├── vite.config.ts          Vite config (just the React plugin)
├── eslint.config.js        Flat ESLint config: TS + react-hooks + react-refresh
├── tsconfig.json           Root config — delegates to the two below
├── tsconfig.app.json       Rules for src/ (strict-ish, bundler resolution)
├── tsconfig.node.json      Rules for config files that run in Node
├── .env.example            Template for overriding the mock login credentials
├── .claude/launch.json     Tells Claude Code how to start the dev server
├── public/                 Copied to the build root as-is
│   └── favicon.svg
├── dist/                   Build output — generated, git-ignored, never edit
└── src/
    ├── main.tsx            App entry: mounts React and wraps it in the providers
    ├── App.tsx             The route table
    ├── index.css           All styling — one hand-written stylesheet
    ├── app/                Store wiring (not features)
    │   ├── store.ts        configureStore + RootState / AppDispatch types
    │   └── hooks.ts        Pre-typed useAppSelector / useAppDispatch
    ├── components/
    │   ├── Layout.tsx      The persistent shell: nav, <Outlet />, status bar
    │   └── RequireAuth.tsx Route guard — redirects signed-out users to /login
    ├── features/           One folder per domain, each owning its slice
    │   ├── auth/
    │   │   ├── authSlice.ts        Token state, login thunk, selectors
    │   │   ├── authPersistence.ts  localStorage writes + cross-tab sync
    │   │   └── jwt.ts              Mock JWT minting and decoding
    │   ├── counter/
    │   │   └── counterSlice.ts
    │   └── todos/
    │       └── todosSlice.ts
    └── pages/              One component per route
        ├── Home.tsx
        ├── LoginPage.tsx
        ├── CounterPage.tsx
        ├── TodosPage.tsx
        ├── TodoDetailPage.tsx
        └── NotFound.tsx
```

### The four folders inside `src/`, and why they're separate

| Folder        | Holds                          | Rule of thumb                                                                 |
| ------------- | ------------------------------ | ----------------------------------------------------------------------------- |
| `app/`        | Store setup and typed hooks    | Infrastructure, not features. Nothing domain-specific goes here.               |
| `features/`   | One folder per domain          | Each owns its slice, its actions, and its selectors. Features don't import each other. |
| `components/` | Reusable / shared UI           | Anything rendered by more than one page, or that isn't itself a route.         |
| `pages/`      | One component per route        | Only these are referenced from `App.tsx`. Pages read the store; they don't define it. |

---

## File-by-file

### Entry and routing

| File | Purpose |
| ---- | ------- |
| [`index.html`](index.html) | The single HTML page. Contains `<div id="root">` and a module script pointing at `src/main.tsx`. Vite rewrites this at build time. |
| [`src/main.tsx`](src/main.tsx) | Creates the React root and wraps `<App />` in three providers, **in this order**: `StrictMode` → `Provider` (Redux) → `BrowserRouter` (Router). The store sits *outside* the router, which is what lets state survive navigation. |
| [`src/App.tsx`](src/App.tsx) | The whole route table. Every route is a child of one layout route, so `Layout` renders once and only the inner page swaps. The protected routes are nested one level deeper, inside `RequireAuth`. |

### State

| File | Purpose |
| ---- | ------- |
| [`src/app/store.ts`](src/app/store.ts) | Calls `configureStore` with the two slice reducers, then exports `RootState` and `AppDispatch` **inferred from the store itself** — so the types update automatically when you add a reducer. |
| [`src/app/hooks.ts`](src/app/hooks.ts) | Exports `useAppDispatch` / `useAppSelector`, built with `useDispatch.withTypes<AppDispatch>()`. Components import these instead of the raw `react-redux` hooks — that's the single place typing comes from. |
| [`src/features/auth/authSlice.ts`](src/features/auth/authSlice.ts) | State: `{ token, status, error }`. The `login` thunk checks the credentials, mints a token and rejects with a message on failure; `loggedOut`, `tokenSynced` and `errorCleared` are plain reducers. Exports `selectIsAuthenticated`, `selectUsername` (memoized — it decodes the token) and friends. |
| [`src/features/auth/authPersistence.ts`](src/features/auth/authPersistence.ts) | Two side effects kept out of the reducers: a listener middleware that writes the token to `localStorage` on login and clears it on logout, and `startAuthSync`, which listens for `storage` events so signing out in one tab signs out the others. |
| [`src/features/auth/jwt.ts`](src/features/auth/jwt.ts) | Mints and decodes a structurally valid (but unsigned) JWT entirely in the browser. The signature is a fixed placeholder; only the `exp` claim does real work. |
| [`src/features/counter/counterSlice.ts`](src/features/counter/counterSlice.ts) | State: `{ value, status }`. Four sync reducers (`increment`, `decrement`, `incrementByAmount`, `reset`) plus `incrementAsync`, a `createAsyncThunk` with a fake 700 ms delay whose `pending` / `fulfilled` / `rejected` cases are handled in `extraReducers`. Exports `selectCount` and `selectCounterStatus`. |
| [`src/features/todos/todosSlice.ts`](src/features/todos/todosSlice.ts) | State: `{ items, filter }`, seeded with three todos. Reducers: `addTodo` (uses a `prepare` callback so `nanoid()` stays out of the reducer), `toggleTodo`, `removeTodo`, `setFilter`, `clearCompleted`. Exports memoized `selectVisibleTodos` and `selectTodoStats` via `createSelector`, plus `selectTodoById`. |

### UI

| File | Purpose |
| ---- | ------- |
| [`src/components/Layout.tsx`](src/components/Layout.tsx) | The app shell. Renders the top nav (`NavLink`, so the active route gets styled), an `<Outlet />` for the current page, and the footer status bar that reads `selectCount` and `selectTodoStats` straight from the store. |
| [`src/components/RequireAuth.tsx`](src/components/RequireAuth.tsx) | The route guard, used as a layout route. Renders `<Outlet />` when signed in, otherwise `<Navigate to="/login">` — recording the attempted path in `location.state` so login can send the user back. |
| [`src/pages/LoginPage.tsx`](src/pages/LoginPage.tsx) | The sign-in form. Dispatches the `login` thunk, shows the rejection message, disables the button while pending, and redirects to wherever the guard came from (defaulting to `/counter`). |
| [`src/pages/Home.tsx`](src/pages/Home.tsx) | Landing page: hero, two cards linking into the demos, and a short "how it fits together" list. Pure presentation — touches no store. |
| [`src/pages/CounterPage.tsx`](src/pages/CounterPage.tsx) | Dispatches every counter action. Also shows the local/global split: the "Amount" input is `useState`, because nothing else needs it. |
| [`src/pages/TodosPage.tsx`](src/pages/TodosPage.tsx) | Add form, the all/active/done filter group, clear-completed, and the list — each row linking to its detail route. |
| [`src/pages/TodoDetailPage.tsx`](src/pages/TodoDetailPage.tsx) | Reads `:todoId` with `useParams`, looks the todo up in the store, and renders a not-found state if it's missing. Delete dispatches `removeTodo` then `useNavigate()`s back to `/todos`. |
| [`src/pages/NotFound.tsx`](src/pages/NotFound.tsx) | Catch-all 404 for the `*` route. |
| [`src/index.css`](src/index.css) | Every style in the app. CSS custom properties on `:root` define the palette, and a `prefers-color-scheme: dark` block overrides them — that's the entire dark-mode implementation. No CSS framework. |

### Config

| File | Purpose |
| ---- | ------- |
| [`vite.config.ts`](vite.config.ts) | Minimal — just `@vitejs/plugin-react`. Add dev-server proxying, path aliases, or env handling here. |
| [`tsconfig.json`](tsconfig.json) | Project-references root; holds no rules itself. |
| [`tsconfig.app.json`](tsconfig.app.json) | Applies to `src/`. Notable: `verbatimModuleSyntax` (type-only imports must say `import type`), `noUnusedLocals` / `noUnusedParameters`, and `noEmit` — Vite does the emitting, `tsc` only checks. |
| [`tsconfig.node.json`](tsconfig.node.json) | Applies to config files that run in Node rather than the browser. |
| [`eslint.config.js`](eslint.config.js) | Flat config. Ignores `dist/`, then layers JS recommended → TypeScript recommended → `react-hooks` → `react-refresh`. |
| [`.env.example`](.env.example) | Template for `VITE_ADMIN_USERNAME` / `VITE_ADMIN_PASSWORD`. Copy to `.env` to change the mock credentials; `.env` is git-ignored. |
| [`.claude/launch.json`](.claude/launch.json) | Declares the `typescript-react` dev server on port 5173 so Claude Code can start and preview it. |
| [`public/`](public/) | Static files copied verbatim into the build. Reference them from the root, e.g. `/favicon.svg`. |

---

## Routes

| Path             | Page             | Access     | Demonstrates                                           |
| ---------------- | ---------------- | ---------- | ------------------------------------------------------ |
| `/`              | `Home`           | Public     | Landing page with links into the demos                  |
| `/login`         | `LoginPage`      | Public     | A thunk that can reject, with the error rendered        |
| `/counter`       | `CounterPage`    | **Signed in** | Sync reducers, a payload action, an async thunk      |
| `/todos`         | `TodosPage`      | **Signed in** | List state, filters, a memoized selector             |
| `/todos/:todoId` | `TodoDetailPage` | **Signed in** | Reading a URL param with `useParams`, delete + redirect |
| `*`              | `NotFound`       | Public     | Catch-all 404                                           |

Protected routes are the ones nested inside `RequireAuth` in
[`src/App.tsx`](src/App.tsx). Visiting one while signed out redirects to
`/login`, and signing in returns you to the page you asked for.

---

## Authentication (mock)

There is no auth server. `login` checks the submitted credentials against
`admin` / `admin` (override via `.env`), and on a match
[`jwt.ts`](src/features/auth/jwt.ts) mints a **structurally** valid JWT in the
browser — three base64url segments, an 8-hour `exp`, and a fixed placeholder
signature that nothing ever verifies.

**This is a demo, not security.** The credentials ship inside the JS bundle,
the token is self-issued, and any visitor can mint one from the console. It
exists so the sign-in *flow* — guards, redirects, persistence, pending and
error states — is real enough to learn from and to swap a real backend into.

How the pieces fit:

| Concern | Where it lives |
| ------- | -------------- |
| Credential check, token in state | `login` thunk in [`authSlice.ts`](src/features/auth/authSlice.ts) |
| Writing/clearing `localStorage` | Listener middleware in [`authPersistence.ts`](src/features/auth/authPersistence.ts) |
| Cross-tab sign-out | `startAuthSync`, wired up in [`main.tsx`](src/main.tsx) |
| Blocking routes | [`RequireAuth.tsx`](src/components/RequireAuth.tsx) |
| The form, errors, redirect-back | [`LoginPage.tsx`](src/pages/LoginPage.tsx) |

Three details worth knowing, because each one is a decision rather than an accident:

- **The token is read synchronously when the store is created**, in
  `authSlice`'s `initialState`. This app only ever renders in the browser, so
  there is no "still checking" window — which is why the guard has no spinner
  and a signed-in user can hard-refresh straight onto `/todos` with no flash of
  the login screen.
- **An expired token counts as no token.** `loadToken` discards anything past
  its `exp`, so a stale token in storage lands you on `/login`, not in a
  half-authenticated state.
- **Sign out deliberately does not call `navigate()`.** Clearing the token
  re-renders the still-mounted guard, which redirects on its own. Trying to
  navigate somewhere friendlier from the click handler does not work: React
  Router commits location changes inside a transition, while a Redux dispatch
  reaches React at sync priority, so the guard renders at the *old* location
  and wins the race. Letting it own the redirect is simpler and records the
  page you left, so signing back in returns you there.

---

## How a change flows through the app

Clicking **+1** on the counter page:

```
CounterPage  dispatch(increment())
     ↓
counterSlice  increment reducer runs (Immer applies it immutably)
     ↓
store  new state
     ↓
useAppSelector  re-renders every subscribed component —
                CounterPage's value AND Layout's status bar
```

The status bar is the point of the demo: it lives in `Layout`, outside the
routed pages, so navigating between `/counter` and `/todos` never unmounts it
and the numbers never reset.

---

## Conventions worth keeping

1. **Never import the raw `react-redux` hooks.** Always `useAppSelector` /
   `useAppDispatch` from `src/app/hooks.ts`. That's where the typing comes from.
2. **Slices own their selectors.** No component reads `state.todos.items`
   directly — it imports `selectVisibleTodos`. This means you can reshape a
   slice's state without touching a single component.
3. **Local state stays local.** Form inputs use `useState`. Only state that
   more than one component cares about belongs in the store.
4. **Type-only imports need `import type`** — `verbatimModuleSyntax` is on and
   the build fails otherwise.

### Adding a route

1. Create the component in `src/pages/`.
2. Add a `<Route>` inside the layout route in [`src/App.tsx`](src/App.tsx) —
   nest it inside the `<Route element={<RequireAuth />}>` block if it should
   require signing in, or leave it as a direct child if it's public.
3. If it needs a nav entry, add it to the `links` array in
   [`src/components/Layout.tsx`](src/components/Layout.tsx).

### Adding a feature slice

1. Create `src/features/<name>/<name>Slice.ts` with `createSlice`.
2. Export the actions, the selectors, and the reducer as the default export.
3. Register the reducer in [`src/app/store.ts`](src/app/store.ts) — `RootState`
   picks up the new shape on its own.

---

## Things to know

- **Counter and todo state is in-memory only.** A full page refresh resets it,
  including added todos. Client-side navigation (clicking a nav link) preserves
  it; typing a URL into the address bar does not, because that's a fresh load.
  Add [redux-persist](https://github.com/rt2zz/redux-persist) if you want it to
  stick — or copy the listener-middleware approach in
  [`authPersistence.ts`](src/features/auth/authPersistence.ts), which is
  exactly why the session *does* survive a refresh while the counter doesn't.
- **Deploying needs an SPA fallback.** Because routing is client-side, the host
  must serve `index.html` for unknown paths, or a hard refresh on `/todos` will
  404 at the server before React ever loads.
- **`dist/` is generated.** It's git-ignored; never edit it by hand.
- **There are no tests yet.** Vitest plus React Testing Library is the natural
  fit if you add them — the slices are pure functions and are the easiest place
  to start. [`jwt.ts`](src/features/auth/jwt.ts) is the single best first
  target: no DOM, no store, and the base64url and expiry edge cases are exactly
  the kind of thing that breaks quietly.

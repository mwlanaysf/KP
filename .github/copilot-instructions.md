<!-- copilot-instructions.md - Guidance for AI coding agents working on this repo -->
# Repo snapshot

- Laravel 12 (PHP 8.2) backend with Inertia + React (TSX) frontend.
- Frontend built with Vite; pages live in `resources/js/pages/*.tsx`.
- Controllers are in `app/Http/Controllers`, models under `app/` (PSR-4 `App\\`).
- Database migrations in `database/migrations`. Tests use Pest / PHPUnit.

# Quick dev commands (project root)

- Install backend deps: `composer install` (ensure PHP 8.2+).
- Install frontend deps: `npm install`.
- Local full-stack dev: either run servers individually:
  - `php artisan serve` (backend)
  - `npm run dev` (vite frontend)
  - optionally `php artisan queue:listen` if queue jobs are relevant
  Or use the composer script that runs them concurrently: `composer run dev`.
- Build production frontend: `npm run build`.
- Run tests: `composer test` (this clears config and runs `php artisan test`).
- Typecheck / lint / format frontend: `npm run types`, `npm run lint`, `npm run format`.

# Big-picture architecture (what to know)

- Inertia bridges Laravel controllers → React pages. When a controller returns
  `Inertia::render('Foo')`, the matching frontend component is `resources/js/pages/Foo.tsx`.
- Ziggy is used for named route generation in the browser. `resources/js/app.tsx`
  exposes `window.route` from `ziggy-js` — prefer `route('buku.index')` in JS.
- Vite handles bundling and SSR is available via `resources/js/ssr.tsx` and
  composer script `dev:ssr` (runs `php artisan pail` + `php artisan inertia:start-ssr`).
- Background jobs: the repo uses Laravel queues in dev scripts (`queue:listen`).

# Project-specific conventions and patterns

- Controllers are resourceful (see `routes/web.php` using `Route::resource`).
  When adding CRUD endpoints, follow the resource-controller pattern.
- Routes are grouped behind `auth` and `verified` middleware for the app area.
- UI components and pages are TypeScript + React; use the page naming that matches
  Inertia render names (case-sensitive file names in `resources/js/pages`).
- Database tests run using in-memory sqlite (see `phpunit.xml`). Tests can run
  without an external DB.

# Integration points to be aware of (examples)

- PDF generation: `barryvdh/laravel-dompdf` used for reports (see `LaporanController`).
- Ziggy: route helper integration between PHP and JS (see `resources/js/app.tsx`).
- Inertia SSR: optional, enabled via composer scripts (`dev:ssr`) and `pail`.

# Examples to cite in PR comments or edits

- Map controller → page: `Route::get('/', fn() => Inertia::render('welcome'))`
  → `resources/js/pages/welcome.tsx`.
- Route helper in JS: `window.route('buku.search')` (ziggy exposed globally in `app.tsx`).
- Dev full-stack: `composer run dev` runs `php artisan serve`, `queue:listen`, and `npm run dev` concurrently.

# Do / Don't (practical rules)

- DO match Inertia render names to exact page filenames under `resources/js/pages`.
- DO run `composer test` when changing backend behavior; `phpunit.xml` sets test env to sqlite in-memory.
- DO run `npm run types` before frontend PRs to catch TS errors.
- DON'T assume a running DB during tests; code should respect sqlite in-memory test env.

# Where to look for more hints

- Controllers: `app/Http/Controllers/` (examples: `DendaController.php`, `PeminjamanController.php`).
- Frontend entry and global wiring: `resources/js/app.tsx`.
- Build scripts: `package.json` and `composer.json` (they contain the canonical dev & build commands).

If anything above is incomplete or you want more detail on a particular area (routes, testing, or SSR), say which part and I'll expand the instructions or add examples.

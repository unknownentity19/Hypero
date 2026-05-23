# Hypero

A modern multi-page marketing site and product hub for Hypero — a visual AI workflow builder.

Built with **Next.js 16** (App Router, Turbopack), **React 19**, **Tailwind v4**, **Framer Motion**, **cmdk**, and **lucide-react**.

## Routes

| Path         | Purpose                                                  |
| ------------ | -------------------------------------------------------- |
| `/`          | Marketing home with full SaaS sections                   |
| `/product`   | Product overview + architecture + comparison             |
| `/features`  | Six in-depth features with use cases and UI mocks        |
| `/solutions` | Industry use cases with example workflows                |
| `/docs`      | Developer docs with sticky sidebar                       |
| `/pricing`   | Tiered pricing, comparison table, FAQ                    |
| `/signin`    | Email + social sign-in (mocked, client-side persistence) |
| `/signup`    | Account creation with workspace + password strength      |
| `/dashboard` | Auth-gated mock dashboard                                |

Auth uses a client-side mock with `localStorage` to demonstrate the flow end-to-end. Replace `src/components/auth/auth-provider.tsx` with a real provider (NextAuth, Clerk, etc.) when wiring to a backend.

## Local development

```bash
npm install
npm run dev
```

The app will start on http://localhost:3000.

### Useful scripts

```bash
npm run dev         # Turbopack dev server
npm run build       # Production build
npm run start       # Run the production server locally
npm run typecheck   # tsc --noEmit
```

## Deployment to Vercel

This project is preconfigured for Vercel. The simplest path:

1. Push the repo to GitHub / GitLab / Bitbucket.
2. Visit https://vercel.com/new and import the project.
3. Vercel auto-detects Next.js — accept the defaults.
4. In **Settings → Environment Variables**, add:
   - `NEXT_PUBLIC_SITE_URL` → your production URL, e.g. `https://hypero.dev`
5. Deploy.

The first build runs `npm run build`; subsequent pushes trigger preview deploys per branch.

### Why `NEXT_PUBLIC_SITE_URL`?

It's used to render absolute URLs in:

- `metadataBase` (Open Graph, canonical, Twitter card)
- `sitemap.xml`
- `robots.txt`
- The dynamic OG image at `/opengraph-image`

If unset, the app falls back to `VERCEL_URL` for preview deployments and `http://localhost:3000` for local dev — so you only need to set it explicitly for the production environment.

### What the project ships out of the box

- **All 9 routes statically prerendered** at build time
- **Dynamic Open Graph image** at `/opengraph-image` (Edge runtime)
- **`sitemap.xml`** generated from `src/app/sitemap.ts`
- **`robots.txt`** with sensible defaults (blocks `/dashboard`)
- **Custom 404 page** at `not-found.tsx`
- **Security headers** set in `next.config.ts` and `vercel.json`
- **`/login` → `/signin`** and **`/register` → `/signup`** redirects
- **Theme toggle** with light/dark/system persistence
- **Command palette** (⌘K) for navigation

### Custom domains

Add your domain under **Settings → Domains** on Vercel, then update `NEXT_PUBLIC_SITE_URL` to match. The metadata, sitemap, and OG images will pick it up automatically on the next deploy.

## Project structure

```
src/
├── app/
│   ├── (auth)/             # /signin, /signup with shared layout
│   ├── dashboard/
│   ├── docs/
│   ├── features/
│   ├── pricing/
│   ├── product/
│   ├── solutions/
│   ├── layout.tsx          # Root layout, metadata, providers
│   ├── not-found.tsx
│   ├── opengraph-image.tsx # Dynamic OG (edge)
│   ├── robots.ts
│   ├── sitemap.ts
│   └── globals.css
├── components/
│   ├── auth/               # Mock auth provider + social icons
│   ├── brand/              # Logo + logomark
│   ├── command/            # ⌘K palette
│   ├── docs/               # Docs sidebar + code block
│   ├── layout/             # Navbar + footer
│   ├── motion/             # Framer Motion helpers
│   ├── ui/                 # Buttons, cards, inputs, sections, badges
│   └── visuals/            # Workflow preview, integration logos, mocks
└── lib/
    ├── site.ts             # Site config (name, URL, OG)
    └── utils.ts            # cn()
```

## License

UNLICENSED — internal use only for now.

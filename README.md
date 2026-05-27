# NovelNest

Platform UGC untuk penulis dan pembaca novel. Gratis baca, gratis terbitkan karya.

## Fitur

- **Auth** — Register, login, JWT cookie-based, role system (reader/author/admin)
- **Novel** — CRUD, genre/tag/category, cover upload, search, filter, pagination
- **Chapter** — Rich text editor (TipTap), scroll & flip reading mode, tema, font scaling
- **Review & Report** — Bintang 1-5, komentar, sistem laporan dengan auto-flag
- **Author Dashboard** — Kelola novel & chapter, edit/hapus, statistik
- **Admin Panel** — Kelola user/novel/report, genre & tag management, flagged chapters
- **Bookmark** — Simpan novel favorit
- **Riwayat Baca** — Auto-save progress, "Lanjut Baca"
- **Komentar Chapter** — Diskusi per bab
- **Wallet & Koin** — Sistem pembelian bab premium (struktur siap)
- **Email Verification** — Verifikasi email & reset password (dev: token di console)
- **Security** — Rate limiting, XSS sanitization, HTTP-only cookies
- **SEO** — Sitemap, robots.txt, metadata dinamis
- **Error Pages** — 404 & 500 custom

## Stack

- Next.js 14 (App Router) + TypeScript
- Prisma + SQLite (bisa diganti PostgreSQL)
- Tailwind CSS
- TipTap (rich text editor)
- JWT + bcryptjs
- Vitest (testing)

## Mulai

```bash
# Install
npm install

# Setup database
npx prisma generate && npx prisma db push

# Seed data dummy
npm run seed

# Development
npm run dev

# Build production
npm run build

# Test
npm test
```

## Akun Dummy

| Role | Email | Password |
|------|-------|----------|
| Author | penulis@novelnest.com | password123 |
| Reader | pembaca@novelnest.com | password123 |
| Author | rin@novelnest.com | password123 |
| Author | bayu@novelnest.com | password123 |
| Author | dian@novelnest.com | password123 |

> Untuk akses admin, ubah role user via Prisma: `npx prisma db execute` atau langsung di file `dev.db`.

## Struktur

```
src/
├── app/
│   ├── api/        # REST API routes
│   ├── admin/      # Admin panel
│   ├── author/     # Author dashboard
│   ├── auth/       # Login, register, reset password
│   ├── novels/     # Browse & detail novel
│   └── profile/    # User profile
├── components/     # Layout, editor, reading theme
└── lib/            # Auth, prisma, rate-limit, utils
prisma/
└── schema.prisma   # Database schema
```

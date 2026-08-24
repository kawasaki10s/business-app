# Biznes Boshqaruv Platformasi

3 investor + 1 admin uchun biznesni boshqarish/raqamlashtirish web-ilovasi.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- PostgreSQL + Prisma ORM
- NextAuth (Credentials) + bcrypt
- Tailwind CSS
- Recharts, ExcelJS, @react-pdf/renderer

## O'rnatish

### 1. Talablar

- Node.js 20+
- PostgreSQL 14+ (lokal yoki masalan Supabase/Neon/Railway kabi bulutli xizmat)

### 2. Paketlarni o'rnatish

```bash
npm install
```

### 3. Environment sozlash

`.env.example` faylini `.env` ga nusxalang va to'ldiring:

```bash
cp .env.example .env
```

- `DATABASE_URL` — PostgreSQL ulanish satri
- `NEXTAUTH_SECRET` — `openssl rand -base64 32` bilan generatsiya qiling
- `CARD_ENCRYPTION_KEY` — `openssl rand -base64 32` bilan generatsiya qiling (32 bayt, base64)

### 4. Database'ni tayyorlash

```bash
npm run prisma:migrate
npm run prisma:seed
```

Seed skripti quyidagi 4 ta akkauntni yaratadi (barchasi uchun boshlang'ich parol: `ChangeMe123!`):

| Rol | Email |
|---|---|
| Admin | admin@business.local |
| Investor | user1@business.local |
| Investor | user2@business.local |
| Investor | user3@business.local |

**Production'ga chiqishdan oldin albatta parollarni o'zgartiring** (`/settings` sahifasidan).

### 5. Ishga tushirish

```bash
npm run dev
```

`http://localhost:3000` da ochiladi.

### 6. Testlarni ishga tushirish

Barcha moliyaviy logika (`lib/finance/*`) uchun avtomatik testlar mavjud, jumladan spec'dagi TEST 1–6:

```bash
npm test
```

## Loyiha tuzilishi

```
/app            -> sahifalar (investor va admin route group'lari + API route'lar)
/lib            -> server-side logika (auth, permissions, finance core, db)
/lib/finance    -> BARCHA moliyaviy hisob-kitoblar shu yerda, pure function sifatida
/components     -> UI komponentlar
/prisma         -> schema.prisma + seed.ts
/tests          -> finance logikasi uchun avtomatik testlar
```

## Muhim arxitektura qarorlari

- **Ownership** hech qachon `33.33%` sifatida saqlanmaydi — faqat aniq fraction (`numerator/denominator`, masalan `1/3`) sifatida. Foizlar faqat UI'da ko'rsatish uchun hisoblanadi.
- **Rounding**: Largest Remainder Method ishlatiladi — ulush qiymatlari yig'indisi har doim biznes qiymatiga aniq teng bo'ladi (999 999 yoki 1 000 001 hech qachon chiqmaydi).
- **Loan va Balance Spending** butunlay alohida logika — hech qachon aralashmaydi.
- **Barcha moliyaviy yozuvlar** (`Transaction` + `LedgerEntry`) Prisma `$transaction()` ichida atomik yaratiladi — bittasi muvaffaqiyatsiz bo'lsa, hammasi rollback bo'ladi.
- **Server-side authorization majburiy**: `lib/permissions.ts` — har bir API route shu yerdan `requirePermission()`/`requireAdmin()` chaqiradi. Frontend faqat qulaylik uchun tugmalarni yashiradi.
- **Global History** barcha investorlar uchun bir xil (`/api/history`) — foydalanuvchiga xos filtr yo'q.
- **Audit Log** History'dan alohida — faqat admin harakatlarini (kim, nima, eski/yangi qiymat) yozadi.
- **Kartalar** — to'liq raqam hech qachon frontendga qaytarilmaydi, faqat oxirgi 4 raqam. To'liq ma'lumot AES-256-GCM bilan shifrlanadi (`lib/cardEncryption.ts`).

## Deploy

Vercel + Neon/Supabase (PostgreSQL) kombinatsiyasi eng oson yo'l:

1. Repo'ni GitHub'ga push qiling
2. Vercel'da import qiling
3. Environment variables'ni Vercel dashboard'da sozlang
4. Deploy qiling, keyin `npx prisma migrate deploy && npx prisma db seed` ni bir marta ishga tushiring

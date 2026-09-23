# Masjid Portal MVP

یک پروژه Next.js شامل:
- لندینگ (هدر، اسلایدر اصلی، معرفی، اسلایدر سفر دو ساله، فوتر)
- ورود/ثبت‌نام با NextAuth (Credentials)
- پنل ادمین برای مدیریت روایت سکشنی و کاربران

## Tech Stack

- Next.js 16 + App Router + TypeScript
- Tailwind CSS
- Swiper.js
- Prisma + PostgreSQL
- NextAuth

## Setup Local

1. نصب وابستگی‌ها:

```bash
npm install --legacy-peer-deps
```

2. تنظیم env:

```bash
cp .env.example .env.local
```

مقادیر زیر را در `.env.local` تکمیل کنید:
- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- (اختیاری) `ADMIN_EMAIL`, `ADMIN_PASSWORD`

3. ساخت Prisma Client و اعمال اسکیمای دیتابیس:

```bash
npm run db:generate
npm run db:push
```

4. ساخت ادمین اولیه:

```bash
npm run db:seed
```

5. اجرای پروژه:

```bash
npm run dev
```

## Deploy روی Vercel

1. پروژه را به Vercel وصل کن.
2. یک دیتابیس PostgreSQL بساز (Vercel Postgres یا Neon).
3. متغیرهای محیطی را در Vercel ست کن:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (مثلا `https://your-domain.vercel.app`)
   - `NEXTAUTH_SECRET`
   - `ADMIN_EMAIL` و `ADMIN_PASSWORD` (اختیاری)
4. بعد از اولین Deploy، یک‌بار `db:push` و `db:seed` را روی محیط Production اجرا کن.

## ظرفیت هدف MVP

این معماری برای حداقل:
- ۲۰۰ کاربر ثبت‌نام‌شده
- ۱۰۰ روایت

مناسب است و برای فاز بعدی قابل توسعه می‌ماند.

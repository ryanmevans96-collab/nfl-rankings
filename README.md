# NFL Weekly Power Rankings (Next.js + Prisma + PostgreSQL)

## Quick start (Windows / PowerShell)

1) Unzip this folder where you want it (e.g., `G:\nfl-rankings`).
2) Install dependencies:
   ```powershell
   npm install
   ```
3) Create `.env.local` (copy from `.env.local.example`) and set your PostgreSQL connection string, plus a random `NEXTAUTH_SECRET`:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME?schema=public"
   NEXTAUTH_SECRET="replace-with-random-string"
   NEXTAUTH_URL="http://localhost:3000"
   ```
4) Initialize Prisma & database:
   ```powershell
   npx prisma generate
   npx prisma migrate dev --name init
   npm run prisma:seed
   ```
5) Run locally:
   ```powershell
   npm run dev
   ```
   Open http://localhost:3000

- Homepage shows aggregate rankings (LIVE during Tue 00:00 → Thu 19:00 ET).
- Go to `/vote` to drag/drop and submit your weekly ranking.
- One vote per user per week; weekly reset uses Tuesday's date as `weekKey`.

## Deploy
- Host the app on Vercel.
- Use Neon/Supabase for PostgreSQL hosting.
- Set the same env vars in your host.

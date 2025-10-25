import "./globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Providers } from "@/app/providers";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <header className="border-b bg-white">
  <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
    <Link href="/" className="font-semibold">NFL Power Rankings</Link>

    <nav className="flex items-center gap-4 text-sm">
      <Link href="/">Home</Link>
      <Link href="/vote">Vote</Link>
      <Link href="/auth">Auth</Link>
    </nav>

    <div className="text-sm">
      {session?.user ? (
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">Welcome, <strong>{session.user.name ?? session.user.email}</strong></span>
          <form action="/api/auth/signout" method="post">
            <button className="underline">Sign out</button>
          </form>
        </div>
      ) : (
        <Link href="/auth" className="underline">Sign in</Link>
      )}
    </div>
  </div>
</header>


        <Providers>
          <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}

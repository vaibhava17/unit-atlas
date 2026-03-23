import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UnitAtlas – Geo-Aware Land Unit Converter",
  description:
    "Convert between regional land measurement units across India. Community-driven, open-source.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <nav className="border-b border-[var(--border)] px-6 py-3 flex items-center gap-6">
          <Link href="/" className="font-bold text-lg tracking-tight">
            UnitAtlas
          </Link>
          <Link
            href="/"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Units
          </Link>
          <Link
            href="/convert"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Convert
          </Link>
          <Link
            href="/contribute"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Contribute
          </Link>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--muted)]">
          UnitAtlas — Open-source geo-aware unit registry
        </footer>
      </body>
    </html>
  );
}

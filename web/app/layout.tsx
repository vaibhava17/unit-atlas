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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://unitatlas.hortiprise.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "UnitAtlas – Geo-Aware Land Unit Converter",
    template: "%s | UnitAtlas",
  },
  description:
    "Convert between regional land measurement units across India. Bigha, Katha, Guntha, Kanal and 70+ units with state-wise variations. Open-source API & community-driven.",
  keywords: [
    "land unit converter",
    "bigha to acre",
    "katha to sqft",
    "indian land units",
    "area conversion india",
    "guntha",
    "kanal",
    "marla",
    "land measurement",
    "unit atlas",
    "geo unit api",
    "property unit converter",
  ],
  authors: [
    { name: "vaibhava17", url: "https://github.com/vaibhava17" },
  ],
  creator: "vaibhava17",
  publisher: "UnitAtlas",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "UnitAtlas",
    title: "UnitAtlas – Geo-Aware Land Unit Converter",
    description:
      "Convert between 70+ regional land measurement units across India. State-wise Bigha, Katha, Guntha, Kanal values. Free open-source API.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "UnitAtlas – Land Unit Converter for India",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UnitAtlas – Geo-Aware Land Unit Converter",
    description:
      "Convert Bigha, Katha, Guntha, Kanal & 70+ Indian land units. Free API with state-wise variations.",
    images: ["/og-image.png"],
    creator: "@vaibhava17",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "UnitAtlas",
              url: SITE_URL,
              description:
                "Convert between 70+ regional land measurement units across India with state-wise variations.",
              applicationCategory: "UtilityApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "vaibhava17",
                url: "https://github.com/vaibhava17",
                email: "iamvaibhav.agarwal@gmail.com",
              },
            }),
          }}
        />
        <nav className="sticky top-0 z-50 bg-[var(--background)] border-b border-[var(--border)] px-6 py-3 flex items-center gap-6">
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
          <Link
            href="/docs"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            API Docs
          </Link>
          <div className="flex-1" />
          <Link
            href="/admin"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            Admin
          </Link>
        </nav>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[var(--border)] px-6 py-4 text-center text-xs text-[var(--muted)] space-y-1">
          <p>UnitAtlas — Open-source geo-aware unit registry</p>
          <p>
            Managed by{" "}
            <a href="https://github.com/vaibhava17" target="_blank" rel="noopener noreferrer" className="text-[var(--foreground)] hover:underline">vaibhava17</a>
            {" · "}
            <a href="mailto:iamvaibhav.agarwal@gmail.com" className="text-[var(--foreground)] hover:underline">iamvaibhav.agarwal@gmail.com</a>
          </p>
        </footer>
      </body>
    </html>
  );
}

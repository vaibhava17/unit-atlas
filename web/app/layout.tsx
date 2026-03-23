import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import I18nProvider from "@/lib/i18n/I18nProvider";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { SITE_URL } from "@/lib/constants";

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
        <I18nProvider>
          <NavBar />
          <main className="flex-1">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}

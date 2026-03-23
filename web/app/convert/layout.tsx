import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert Land Units",
  description:
    "Convert between Bigha, Acre, Katha, Guntha, Kanal, Marla and 70+ Indian land units. State-wise accurate conversion factors.",
  openGraph: {
    title: "Convert Land Units | UnitAtlas",
    description:
      "Convert between 70+ regional land units across India. Bigha to Acre, Katha to Sqft and more.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

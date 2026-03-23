import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contribute a Unit",
  description:
    "Submit a local land measurement unit from your region. Community contributions are reviewed before publishing to the UnitAtlas database.",
  openGraph: {
    title: "Contribute a Unit | UnitAtlas",
    description:
      "Help build the largest database of Indian land units. Submit local units from your region.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

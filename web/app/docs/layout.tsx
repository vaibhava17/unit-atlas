import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation",
  description:
    "UnitAtlas REST API docs. Endpoints for listing units, looking up by name/alias, and converting between land measurement units with geo-fallback resolution.",
  openGraph: {
    title: "API Documentation | UnitAtlas",
    description:
      "Free REST API for Indian land unit conversions. Interactive playground, curl examples, and full endpoint reference.",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

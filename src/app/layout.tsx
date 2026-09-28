import type { Metadata } from "next";
import { SiteDocument } from "@/components/layout/SiteDocument";
import { site } from "@/lib/apps/apps";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.publisher,
    template: `%s — ${site.publisher}`,
  },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <SiteDocument publisher={site.publisher}>{children}</SiteDocument>;
}

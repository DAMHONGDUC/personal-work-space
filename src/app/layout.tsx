import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ScrollMemory } from "@/components/ScrollMemory";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/apps";
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
  metadataBase: new URL(site.url),
  title: {
    default: site.publisher,
    template: `%s — ${site.publisher}`,
  },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      // globals.css sets scroll-behavior: smooth for the in-page policy anchors.
      // This tells Next that is deliberate, so it does not also animate route
      // changes — and stops it warning about the one it cannot tell apart.
      data-scroll-behavior="smooth"
      // Extensions routinely rewrite <html> (theme switchers, font tweakers)
      // before React hydrates, which reports as an attribute mismatch nothing
      // in this codebase can fix: it never occurs in a clean browser profile.
      // This suppresses the warning for this element's own attributes only —
      // one level deep — so a genuine mismatch inside the app still surfaces.
      suppressHydrationWarning
    >
      {/* min-h-screen (not h-full on <html>) keeps the sticky footer without
          pinning <html> to the viewport height, which would break the document
          scroll the sticky header and reading progress depend on. */}
      <body className="flex min-h-screen flex-col font-sans">
        {/* Renders nothing: it puts you back where you were on Back. */}
        <ScrollMemory />

        <SiteHeader publisher={site.publisher} />

        <div className="flex-1">{children}</div>

        <SiteFooter publisher={site.publisher} />
      </body>
    </html>
  );
}

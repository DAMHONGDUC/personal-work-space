import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/layout/SiteShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/** The whole document: `<html>` with the site's fonts, and the shell inside it. */
export function SiteDocument({ publisher, children }: { publisher: string; children: ReactNode }) {
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
      <SiteShell publisher={publisher}>{children}</SiteShell>
    </html>
  );
}

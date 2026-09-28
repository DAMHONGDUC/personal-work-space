import type { Metadata } from "next";
import { LegacyRedirect } from "@/components/layout/LegacyRedirect";
import { routes } from "@/lib/routes/routes";

// The section has no index of its own, so its root forwards instead of 404ing
// — to the portfolio rather than the CV, because the CV is behind a password
// and a visitor who typed /personal should land on something they can read.
export const metadata: Metadata = { robots: { index: false } };

export default function PersonalIndexPage() {
  return <LegacyRedirect href={routes.portfolio} label="the portfolio" />;
}

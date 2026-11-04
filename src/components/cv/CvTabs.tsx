"use client";

import { CoverLetter } from "@/components/cv/CoverLetter";
import { CvSwitcher } from "@/components/cv/CvSwitcher";
import { UpworkProfile } from "@/components/cv/UpworkProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryChoice } from "@/hooks/routes/useQueryParam";
import type { CvVersion } from "@/lib/cv/cv-types";
import type { UpworkProfile as Upwork } from "@/lib/cv/upwork";
import { CV_QUERY } from "@/lib/routes/routes";

/** The tabs, in order; the first opens when the address names none. */
const TABS = ["cv", "cover-letter", "upwork"] as const;
type Tab = (typeof TABS)[number];

/** Inactive panels stay mounted, hidden, so the chosen CV version survives a trip to the letter. */
const PANEL = "data-[state=inactive]:hidden";

/**
 * The CV page's things to take away, one tab each: the CV, the cover letter
 * sent with it, and the Upwork profile. The CV opens first.
 *
 * The open tab lives in the address (`CV_QUERY.tab`), so a reload or a shared
 * link opens on it; the CV tab leaves the address bare.
 */
export function CvTabs({
  versions,
  coverLetter,
  upwork,
}: {
  versions: CvVersion[];
  coverLetter: string;
  upwork: Upwork;
}) {
  const [tab, setTab] = useQueryChoice(CV_QUERY.tab, TABS);

  return (
    <Tabs
      value={tab ?? TABS[0]}
      onValueChange={(next) => setTab(next === TABS[0] ? null : (next as Tab))}
      className="gap-8"
    >
      <TabsList className="h-11 w-full max-w-md">
        <TabsTrigger value="cv">CV</TabsTrigger>
        <TabsTrigger value="cover-letter">Cover letter</TabsTrigger>
        <TabsTrigger value="upwork">Upwork</TabsTrigger>
      </TabsList>

      <TabsContent value="cv" forceMount className={PANEL}>
        <CvSwitcher versions={versions} />
      </TabsContent>
      <TabsContent value="cover-letter" forceMount className={PANEL}>
        <CoverLetter text={coverLetter} />
      </TabsContent>
      <TabsContent value="upwork" forceMount className={PANEL}>
        <UpworkProfile profile={upwork} />
      </TabsContent>
    </Tabs>
  );
}

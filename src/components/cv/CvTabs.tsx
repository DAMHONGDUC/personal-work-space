import { CoverLetter } from "@/components/cv/CoverLetter";
import { CvSwitcher } from "@/components/cv/CvSwitcher";
import { UpworkProfile } from "@/components/cv/UpworkProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CvVersion } from "@/lib/cv/cv-types";
import type { UpworkProfile as Upwork } from "@/lib/cv/upwork";

/** Inactive panels stay mounted, hidden, so the chosen CV version survives a trip to the letter. */
const PANEL = "data-[state=inactive]:hidden";

/**
 * The CV page's things to take away, one tab each: the CV, the cover letter
 * sent with it, and the Upwork profile. The CV opens first.
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
  return (
    <Tabs defaultValue="cv" className="gap-8">
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

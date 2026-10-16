import { CoverLetter } from "@/components/cv/CoverLetter";
import { CvSwitcher } from "@/components/cv/CvSwitcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CvVersion } from "@/lib/cv/cv-types";

/** Inactive panels stay mounted, hidden, so the chosen CV version survives a trip to the letter. */
const PANEL = "data-[state=inactive]:hidden";

/**
 * The CV page's two things to take away, one tab each: the CV, then the
 * cover letter sent with it. The CV opens first.
 */
export function CvTabs({ versions, coverLetter }: { versions: CvVersion[]; coverLetter: string }) {
  return (
    <Tabs defaultValue="cv" className="gap-8">
      <TabsList className="h-11 w-full max-w-sm">
        <TabsTrigger value="cv">CV</TabsTrigger>
        <TabsTrigger value="cover-letter">Cover letter</TabsTrigger>
      </TabsList>

      <TabsContent value="cv" forceMount className={PANEL}>
        <CvSwitcher versions={versions} />
      </TabsContent>
      <TabsContent value="cover-letter" forceMount className={PANEL}>
        <CoverLetter text={coverLetter} />
      </TabsContent>
    </Tabs>
  );
}

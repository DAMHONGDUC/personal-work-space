import type { Metadata } from "next";
import { CvSwitcher } from "@/components/cv/CvSwitcher";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageIntro } from "@/components/layout/PageIntro";
import { cv, getCvVersions } from "@/lib/cv/cv";
import { routes } from "@/lib/routes/routes";

export const metadata: Metadata = {
  title: "CV",
  description: `Curriculum vitae for ${cv.header.name}.`,
  alternates: { canonical: `${routes.cv}/` },
};

export default function CvPage() {
  // Read at build time and handed over whole: the switcher changes version
  // without a navigation, so it needs every version's pages up front.
  const versions = getCvVersions();

  return (
    <PageContainer>
      {/* Just "CV": the name is already in the site header and again at the
          top of the document below. */}
      <PageIntro title="CV">
        My background, experience and skills. Pick the version that fits what
        you are hiring for, read it below, or take a copy with you.
      </PageIntro>

      <CvSwitcher versions={versions} />
    </PageContainer>
  );
}

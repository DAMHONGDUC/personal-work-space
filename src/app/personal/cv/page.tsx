import type { Metadata } from "next";
import { CvSwitcher } from "@/components/CvSwitcher";
import { cv, getCvVersions } from "@/lib/cv";
import { routes } from "@/lib/routes";

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
    <main className="mx-auto w-full max-w-5xl px-6 py-20">
      <div className="flex max-w-2xl flex-col gap-5 pb-12">
        {/* Just "CV": the name is already in the site header and again at the
            top of the document below. */}
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">CV</h1>
        <p className="text-lg leading-8 text-muted">
          My background, experience and skills. Pick the version that fits what
          you are hiring for, read it below, or take a copy with you.
        </p>
      </div>

      <CvSwitcher versions={versions} />
    </main>
  );
}

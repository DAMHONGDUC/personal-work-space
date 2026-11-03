import { ArrowUpRight, Download } from "lucide-react";
import { CopyBlock } from "@/components/cv/CopyBlock";
import { ProjectCover } from "@/components/shared/ProjectCover";
import { Button } from "@/components/ui/button";
import type { UpworkField, UpworkGroup, UpworkProfile as Profile } from "@/lib/cv/upwork";
import { AppTextStyles } from "@/lib/design/app-text-styles";
import { withBasePath } from "@/lib/routes/routes";

/** The cover Upwork asks to upload, with the file to upload it from. */
function Cover({ group }: { group: UpworkGroup }) {
  if (!group.details) return null;

  return (
    <div className="flex flex-col items-start gap-3">
      <ProjectCover src={group.details.cover} name={group.title} className="max-w-md" />
      <Button asChild variant="outline" size="sm">
        <a href={withBasePath(group.details.cover)} download>
          <Download aria-hidden />
          Download cover
        </a>
      </Button>
    </div>
  );
}

function Fields({ fields, of }: { fields: UpworkField[]; of?: string }) {
  return (
    <div className="flex flex-col gap-3">
      {fields.map((field) => (
        <CopyBlock
          key={field.label}
          caption={field.label}
          text={field.text}
          label={`Copy ${of ? `${of} ` : ""}${field.label.toLowerCase()}`}
        />
      ))}
    </div>
  );
}

function Groups({ title, groups }: { title: string; groups: UpworkGroup[] }) {
  return (
    <section className="flex flex-col gap-5">
      <h2 className={AppTextStyles.CARD_TITLE_SM}>{title}</h2>
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-3">
          <h3 className={AppTextStyles.EYEBROW}>{group.title}</h3>
          <Cover group={group} />
          <Fields fields={group.fields} of={group.title} />
        </div>
      ))}
    </section>
  );
}

/**
 * The Upwork profile, in its own tab beside the CV: every box of Upwork's
 * form as a block to copy, in the order the form asks for them, so the
 * profile is rewritten from here rather than retyped.
 */
export function UpworkProfile({ profile }: { profile: Profile }) {
  return (
    <div className="flex max-w-[80ch] flex-col gap-10">
      {/* No page heading: the tab already names it. */}
      <div className="flex flex-col items-start gap-3">
        <p className={AppTextStyles.SMALL}>
          What my Upwork profile says, box by box: copy one and paste it into Upwork&apos;s form.
        </p>
        <Button asChild variant="outline" size="sm">
          <a href={profile.profileUrl} target="_blank" rel="noreferrer">
            Open on Upwork
            <ArrowUpRight aria-hidden />
          </a>
        </Button>
      </div>

      <section className="flex flex-col gap-5">
        <h2 className={AppTextStyles.CARD_TITLE_SM}>Profile</h2>
        <Fields fields={profile.profile} />
      </section>
      <Groups title="Portfolio" groups={profile.portfolio} />
      <Groups title="Education" groups={profile.education} />
    </div>
  );
}

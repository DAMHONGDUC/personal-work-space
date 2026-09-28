import { GlassCard } from "@/components/portfolio/GlassCard";
import type { Skill } from "@/lib/cv/cv-types";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * The CV's skills, one card per area. The CV writes each area's items as one
 * comma-separated line; here they are split into chips.
 */
export function SkillGroups({ skills }: { skills: Skill[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {skills.map((skill) => (
        <GlassCard key={skill.name} as="li" className="flex flex-col gap-4">
          <h3 className={AppTextStyles.CARD_TITLE_SM}>{skill.name}</h3>
          <ul className="flex flex-wrap gap-1.5">
            {skill.items.split(/,\s*/).map((item) => (
              <li key={item} className="rounded-lg border border-border-soft bg-muted-surface px-2.5 py-1 text-sm">
                {item}
              </li>
            ))}
          </ul>
        </GlassCard>
      ))}
    </ul>
  );
}

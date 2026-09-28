import { PublicImage } from "@/components/portfolio/PublicImage";
import type { PortfolioSkill } from "@/lib/portfolio/portfolio-model";

function SkillChip({ skill, hidden = false }: { skill: PortfolioSkill; hidden?: boolean }) {
  return (
    <li aria-hidden={hidden || undefined} className={hidden ? "motion-reduce:hidden" : undefined}>
      <a
        href={skill.url}
        target="_blank"
        rel="noreferrer"
        tabIndex={hidden ? -1 : undefined}
        className="flex items-center gap-3 rounded-2xl border border-border-soft bg-surface py-3 pl-3 pr-5 transition-colors hover:border-foreground/25"
      >
        {/* A white tile: several logos are dark on transparent and vanish on
            the dark surface otherwise. */}
        <span className="flex size-10 items-center justify-center rounded-xl bg-white p-1.5">
          <PublicImage src={skill.logo} alt="" className="size-full object-contain" />
        </span>
        <span className="whitespace-nowrap font-medium">{skill.label}</span>
      </a>
    </li>
  );
}

/**
 * The skills scrolling past in an endless row. The list is drawn twice and the
 * track slides by half its width, so the loop has no seam; the copy is hidden
 * from screen readers and the keyboard. With reduced motion the track stands
 * still and wraps instead.
 */
export function SkillMarquee({ skills }: { skills: PortfolioSkill[] }) {
  return (
    <div className="pf-marquee-mask -mx-6 overflow-hidden px-6 motion-reduce:mx-0 motion-reduce:px-0 motion-reduce:[mask-image:none]">
      <ul className="pf-marquee flex w-max gap-3 motion-reduce:w-auto motion-reduce:flex-wrap">
        {skills.map((skill) => (
          <SkillChip key={skill.label} skill={skill} />
        ))}
        {skills.map((skill) => (
          <SkillChip key={`${skill.label}-copy`} skill={skill} hidden />
        ))}
      </ul>
    </div>
  );
}

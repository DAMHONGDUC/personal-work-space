import type { ReactNode } from "react";
import { Clock, GraduationCap, MapPin, Sparkles, type LucideIcon } from "lucide-react";
import { GlassCard } from "@/components/portfolio/GlassCard";
import { StatusPill } from "@/components/portfolio/StatusPill";
import { WebsiteButton } from "@/components/portfolio/WebsiteButton";
import type { Portfolio } from "@/lib/portfolio/portfolio-model";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * One small fact: an icon and a label on one line, the fact under it. Every
 * tile in the column shares this rhythm, so they line up whatever they hold.
 */
function FactTile({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <GlassCard className="flex flex-col gap-3 p-5!">
      <p className={`${AppTextStyles.CAPTION} flex items-center gap-2`}>
        <Icon aria-hidden className="size-4" />
        {label}
      </p>
      {children}
    </GlassCard>
  );
}

/**
 * About, as a bento grid: the introduction and education in the wide tile,
 * and the small facts — where, what is being learnt, availability — stacked
 * beside it. The wide tile keeps its text at the top and its education at the
 * foot, so both columns end on the same line.
 */
export function AboutBento({ portfolio }: { portfolio: Portfolio }) {
  const { about } = portfolio;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <GlassCard className="flex flex-col justify-between gap-8 md:col-span-2 md:row-span-3 md:p-8!">
        <div className="flex max-w-[60ch] flex-col gap-4">
          {portfolio.story.map((paragraph) => (
            <p key={paragraph} className={`${AppTextStyles.BODY} first:text-lg first:leading-8 first:text-foreground`}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-border-soft pt-6">
          <p className={AppTextStyles.EYEBROW}>Education</p>
          {portfolio.education.map((school) => (
            <div key={school.institution} className="flex items-start gap-3">
              <GraduationCap aria-hidden className="mt-0.5 size-5 shrink-0 text-muted" />
              <div className="flex flex-col gap-2.5">
                <div className="flex flex-col gap-0.5">
                  <p className="font-medium">{school.degree}</p>
                  <p className={AppTextStyles.SMALL}>
                    {school.institution} · {school.period}
                  </p>
                </div>
                <WebsiteButton href={school.url} name={school.institution} />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <FactTile icon={MapPin} label="Based in">
        <div className="flex flex-col gap-1">
          <p className="font-semibold">{portfolio.location}</p>
          <p className={`${AppTextStyles.SMALL} flex items-center gap-1.5`}>
            <Clock aria-hidden className="size-3.5" /> {portfolio.timezone}
          </p>
        </div>
      </FactTile>

      <FactTile icon={Sparkles} label="Currently learning">
        <ul className="flex flex-wrap gap-1.5">
          {about.learning.map((topic) => (
            <li key={topic} className="rounded-lg bg-muted-surface px-2.5 py-1 text-sm font-medium">
              {topic}
            </li>
          ))}
        </ul>
      </FactTile>

      <GlassCard className="flex flex-col gap-3 p-5!">
        {portfolio.status && <StatusPill>{portfolio.status}</StatusPill>}
        <a href="#contact" className="w-fit text-lg font-semibold underline-offset-4 hover:underline">
          Let&apos;s work together →
        </a>
      </GlassCard>
    </div>
  );
}

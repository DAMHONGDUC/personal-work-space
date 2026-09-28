import { Clock, GraduationCap, MapPin, Sparkles } from "lucide-react";
import { ExternalLink } from "@/components/portfolio/ExternalLink";
import { GlassCard } from "@/components/portfolio/GlassCard";
import { StatusPill } from "@/components/portfolio/StatusPill";
import type { Portfolio } from "@/lib/portfolio/portfolio-model";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * About, as a bento grid: the CV's About me and education take the big tile,
 * and the small facts — where, what is being learnt, availability — stack
 * beside it a tile each. No photo here: the page shows the CV's one photo, in
 * the hero.
 */
export function AboutBento({ portfolio }: { portfolio: Portfolio }) {
  const { about } = portfolio;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <GlassCard className="flex flex-col justify-between gap-8 md:col-span-2 md:row-span-3">
        <div className="flex flex-col gap-4">
          {portfolio.aboutMe.map((paragraph) => (
            <p key={paragraph} className={`${AppTextStyles.BODY} first:text-lg first:text-foreground`}>
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border-soft pt-5">
          <p className={AppTextStyles.EYEBROW}>Education</p>
          {portfolio.education.map((school) => (
            <div key={school.institution} className="flex items-start gap-3">
              <GraduationCap aria-hidden className="mt-0.5 size-5 shrink-0 text-muted" />
              <div>
                <p className="font-medium">{school.degree}</p>
                <p className={AppTextStyles.SMALL}>
                  <ExternalLink href={school.url}>{school.institution}</ExternalLink> · {school.period}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col justify-between gap-4">
        <MapPin aria-hidden className="size-5 text-muted" />
        <div>
          <p className="font-semibold">{portfolio.location}</p>
          <p className={`${AppTextStyles.SMALL} flex items-center gap-1.5`}>
            <Clock aria-hidden className="size-3.5" /> {portfolio.timezone}
          </p>
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col justify-between gap-4">
        <Sparkles aria-hidden className="size-5 text-muted" />
        <div className="flex flex-col gap-2">
          <p className={AppTextStyles.SMALL}>Currently learning</p>
          <ul className="flex flex-wrap gap-1.5">
            {about.learning.map((topic) => (
              <li key={topic} className="rounded-lg bg-muted-surface px-2.5 py-1 text-sm font-medium">
                {topic}
              </li>
            ))}
          </ul>
        </div>
      </GlassCard>

      <GlassCard className="flex flex-col justify-between gap-4">
        {portfolio.status && <StatusPill>{portfolio.status}</StatusPill>}
        <a href="#contact" className="text-lg font-semibold underline-offset-4 hover:underline">
          Let&apos;s work together →
        </a>
      </GlassCard>
    </div>
  );
}

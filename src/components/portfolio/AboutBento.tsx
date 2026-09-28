import { Clock, MapPin, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/portfolio/GlassCard";
import { PublicImage } from "@/components/portfolio/PublicImage";
import { StatusPill } from "@/components/portfolio/StatusPill";
import type { Portfolio } from "@/lib/portfolio/portfolio-model";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * About, as a bento grid: the story takes the big tile, the photo the tall one,
 * and the small facts — where, what is being learnt, availability — a tile each.
 */
export function AboutBento({ portfolio }: { portfolio: Portfolio }) {
  const { about } = portfolio;

  return (
    <div className="grid gap-4 md:auto-rows-[minmax(9rem,auto)] md:grid-cols-3">
      <GlassCard className="flex flex-col justify-between gap-8 md:col-span-2 md:row-span-2">
        <div className="flex flex-col gap-4">
          {about.body.map((paragraph) => (
            <p key={paragraph} className={`${AppTextStyles.BODY} first:text-lg first:text-foreground`}>
              {paragraph}
            </p>
          ))}
        </div>
        {/* Signs the story off, and fills the tile's foot where the photo
            beside it runs taller than the text. */}
        <p className={AppTextStyles.SMALL}>— {portfolio.name}</p>
      </GlassCard>

      <GlassCard className="p-0! md:row-span-2">
        <PublicImage
          src={about.image}
          alt={portfolio.name}
          className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-105 md:h-full"
        />
      </GlassCard>

      <GlassCard className="flex flex-col justify-between gap-4">
        <MapPin aria-hidden className="size-5 text-muted" />
        <div>
          <p className="font-semibold">{portfolio.location}</p>
          <p className={`${AppTextStyles.SMALL} flex items-center gap-1.5`}>
            <Clock aria-hidden className="size-3.5" /> GMT+7
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

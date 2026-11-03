import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppColors } from "@/lib/design/app-colors";

/**
 * A button straight into a panel of a series ("Sprint guides →"), tinted with
 * the docs accent: on the series' card in the index, and in the header of
 * every page of the series. The panel being read is `active`: filled with the
 * accent, white text, and no arrow, since it leads where the reader already is.
 */
export function PanelButton({ href, name, active = false }: { href: string; name: string; active?: boolean }) {
  return (
    <Button
      asChild
      variant="outline"
      size="sm"
      className={active ? "text-white hover:text-white" : undefined}
      style={
        active
          ? { backgroundColor: AppColors.DOCS, borderColor: AppColors.DOCS }
          : {
              color: AppColors.DOCS,
              borderColor: AppColors.tint(AppColors.DOCS, 40),
              backgroundColor: AppColors.tint(AppColors.DOCS, 10),
            }
      }
    >
      <Link href={href} aria-current={active ? "true" : undefined}>
        {name}
        {!active && <ArrowRight aria-hidden />}
      </Link>
    </Button>
  );
}

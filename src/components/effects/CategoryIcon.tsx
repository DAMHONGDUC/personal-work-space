import { AppColors } from "@/lib/design/app-colors";


/** A category's emoji in the section's tinted square. */
export function CategoryIcon({ icon }: { icon: string }) {
  return (
    <span
      aria-hidden
      className="flex size-10 shrink-0 items-center justify-center rounded-xl border text-lg"
      style={{
        backgroundColor: `${AppColors.tint(AppColors.EFFECTS, 14)}`,
        borderColor: `${AppColors.tint(AppColors.EFFECTS, 28)}`,
      }}
    >
      {icon}
    </span>
  );
}

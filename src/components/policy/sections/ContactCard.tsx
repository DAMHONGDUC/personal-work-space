import type { App } from "@/lib/apps/apps";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";

export function ContactCard({ app, email }: { app: App; email: string }) {
  return (
    <div
      className="rounded-2xl border p-7"
      style={{
        backgroundColor: `${AppColors.tint(app.accent, 6)}`,
        borderColor: `${AppColors.tint(app.accent, 22)}`,
      }}
    >
      <h2 className={AppTextStyles.CARD_TITLE_SM}>
        Questions about {app.name}?
      </h2>
      <p className={`${AppTextStyles.BODY} mt-2 max-w-[60ch]`}>
        We usually reply within a few business days.
      </p>
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(`${app.name} — privacy question`)}`}
        className="mt-4 inline-flex rounded-lg px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        style={{ backgroundColor: app.accent }}
      >
        {email}
      </a>
    </div>
  );
}

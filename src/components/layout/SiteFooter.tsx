import { AppSpacings } from "@/lib/design/app-spacings";
import { AppTextStyles } from "@/lib/design/app-text-styles";

export function SiteFooter({ publisher }: { publisher: string }) {
  return (
    <footer className="mt-auto border-t border-border-soft">
      <div className={`${AppTextStyles.SMALL} ${AppSpacings.CONTAINER} flex flex-col gap-2 py-10 sm:flex-row sm:items-center sm:justify-between`}>
        <p>
          © {new Date().getFullYear()} {publisher}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

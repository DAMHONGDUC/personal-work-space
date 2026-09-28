import { AppTextStyles } from "@/lib/design/app-text-styles";

export function DirectoryHero({
  publisher,
  appCount,
}: {
  publisher: string;
  appCount: number;
}) {
  return (
    <div className="flex max-w-2xl flex-col gap-5 pb-14">
      <span className={`${AppTextStyles.CAPTION} w-fit rounded-full border border-border-soft px-3 py-1`}>
        {appCount} {appCount === 1 ? "app" : "apps"}
      </span>
      <h1 className={AppTextStyles.PAGE_TITLE}>
        Privacy policies
      </h1>
      <p className={AppTextStyles.LEAD}>
        Every app published by {publisher} has its own privacy policy, hosted at a
        permanent address. Pick an app below to read its policy.
      </p>
    </div>
  );
}

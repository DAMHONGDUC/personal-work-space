import type { ReactNode } from "react";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/** A code, a heading and one sentence: the body of a 404 or similar notice. */
export function MessageBlock({
  code,
  title,
  children,
}: {
  code: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <>
      <p className={AppTextStyles.MONO_LABEL}>{code}</p>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className={`${AppTextStyles.BODY} max-w-md`}>{children}</p>
    </>
  );
}

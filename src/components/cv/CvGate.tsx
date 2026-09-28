"use client";

import { LockKeyhole } from "lucide-react";
import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/**
 * SHA-256 of the CV password, so the password itself is not in the bundle.
 *
 * This is a curtain, not a lock: the site is a static export with no server to
 * check anything, so the PDFs and page images stay reachable by their direct
 * URLs, and a short numeric password falls to brute force against this hash.
 * It keeps the CV out of sight of a casual visitor, nothing more.
 */
const PASSWORD_SHA256 = "7c5b3dfc04302fff67bbf86bc4029dc470191ddc9704a6a9501701b191812ba2";

/** Remembered for the tab, so moving around the site does not ask again. */
const UNLOCKED_KEY = "cv-unlocked";

async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Nothing to listen to: the flag only changes through this component. */
function noSubscription(): () => void {
  return () => {};
}

function rememberedUnlock(): boolean {
  try {
    return sessionStorage.getItem(UNLOCKED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Shows `children` — the CV — only once the password has been entered. */
export function CvGate({ children }: { children: ReactNode }) {
  const [unlockedNow, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [wrong, setWrong] = useState(false);
  const [checking, setChecking] = useState(false);

  // Storage only exists in the browser; the server snapshot keeps the
  // exported HTML the locked page, and hydration then reads the real value.
  const remembered = useSyncExternalStore(noSubscription, rememberedUnlock, () => false);
  const unlocked = unlockedNow || remembered;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setChecking(true);
    const matches = (await sha256(password)) === PASSWORD_SHA256;
    setChecking(false);

    if (!matches) {
      setWrong(true);
      return;
    }

    try {
      sessionStorage.setItem(UNLOCKED_KEY, "1");
    } catch {
      // Private mode or blocked storage: unlocked for this page view only.
    }
    setUnlocked(true);
  }

  if (unlocked) return <>{children}</>;

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-border-soft bg-surface p-7"
    >
      <span className="flex size-11 items-center justify-center rounded-xl border border-border-soft bg-muted-surface">
        <LockKeyhole className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className={AppTextStyles.CARD_TITLE_SM}>This CV is private</h2>
        <p className={AppTextStyles.SMALL}>Enter the password you were given to read it.</p>
      </div>

      <label className="flex flex-col gap-2">
        <span className="sr-only">Password</span>
        <Input
          type="password"
          autoComplete="off"
          autoFocus
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setWrong(false);
          }}
          placeholder="Password"
          aria-invalid={wrong || undefined}
          aria-describedby={wrong ? "cv-password-error" : undefined}
          className="h-11 rounded-xl"
        />
      </label>
      {wrong && (
        <p id="cv-password-error" role="alert" className="text-sm text-destructive">
          That password is not right.
        </p>
      )}

      <Button type="submit" disabled={checking || password === ""} className="h-11 rounded-xl">
        Unlock
      </Button>
    </form>
  );
}

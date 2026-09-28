"use client";

import { CheckCircle2, Upload, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { commitUploads } from "@/hooks/effects/useEffectUploads";
import {
  EFFECT_KIND_LABELS,
  type EffectKind,
} from "@/lib/effects/effect-model";
import {
  UPLOAD_CATEGORIES,
  UPLOADS_FOLDER_NAME,
  addToManifest,
  kindOfFile,
  type UploadedItem,
} from "@/lib/effects/effect-uploads";
import {
  canUpload,
  prepareSignIn,
  readUploads,
  signIn,
  uploadFile,
  uploadFolderFor,
  writeUploads,
} from "@/lib/effects/google-drive";
import { AppColors } from "@/lib/design/app-colors";
import { AppTextStyles } from "@/lib/design/app-text-styles";

type Picked = { file: File; kind: EffectKind | null; progress: number };
type Phase = "picking" | "uploading" | "done";

const ACCEPT = "video/*,audio/*,image/*,.otf,.ttf,.woff,.woff2";

function sizeOf(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

/**
 * Uploading to the library, for its owner. The files go to the owner's Drive,
 * under `My uploads/<category>`, and are listed in the manifest beside it — so
 * they appear on every page straight away, with no rebuild.
 *
 * Renders nothing unless the Google client id and API key are configured.
 */
export function EffectUploadButton({ defaultCategory }: { defaultCategory?: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(defaultCategory ?? UPLOAD_CATEGORIES[0].id);
  const [picked, setPicked] = useState<Picked[]>([]);
  const [phase, setPhase] = useState<Phase>("picking");
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  if (!canUpload) return null;

  const accepted = picked.filter((entry) => entry.kind !== null);
  const label = UPLOAD_CATEGORIES.find((option) => option.id === category)?.label ?? category;

  function reset() {
    setPicked([]);
    setPhase("picking");
    setError(null);
    if (input.current) input.current.value = "";
  }

  function onOpenChange(next: boolean) {
    // Closing mid-upload would hide a transfer that carries on regardless.
    if (!next && phase === "uploading") return;
    setOpen(next);
    if (next) {
      prepareSignIn().catch((failure: Error) => setError(failure.message));
    } else {
      reset();
    }
  }

  function setProgress(index: number, progress: number) {
    setPicked((current) => current.map((entry, i) => (i === index ? { ...entry, progress } : entry)));
  }

  async function upload() {
    setError(null);
    // First, and before any await: the sign-in popup must open inside the click.
    const signingIn = signIn();

    let accessToken: string;
    try {
      accessToken = await signingIn;
    } catch (failure) {
      setError((failure as Error).message);
      return;
    }

    setPhase("uploading");
    const done: UploadedItem[] = [];
    let failure: Error | null = null;

    try {
      const folderId = await uploadFolderFor(label, accessToken);
      for (const [index, entry] of picked.entries()) {
        if (!entry.kind) continue;
        const uploaded = await uploadFile(entry.file, folderId, accessToken, (fraction) =>
          setProgress(index, fraction),
        );
        done.push({
          id: uploaded.id,
          file: uploaded.name,
          kind: entry.kind,
          category,
          uploadedAt: new Date().toISOString(),
        });
      }
    } catch (caught) {
      failure = caught as Error;
    }

    // Whatever did upload is listed, even when a later file failed. Read fresh
    // first, so an upload made from another device meanwhile is not lost.
    if (done.length > 0) {
      try {
        const current = await readUploads(accessToken);
        const manifest = addToManifest(current.manifest, done);
        const fileId = await writeUploads(current.fileId, manifest, accessToken);
        commitUploads({ fileId, manifest });
      } catch (caught) {
        failure ??= caught as Error;
      }
    }

    if (failure) {
      setError(failure.message);
      setPhase(done.length > 0 ? "done" : "picking");
      return;
    }
    setPhase("done");
  }

  return (
    <>
      <Button variant="outline" onClick={() => onOpenChange(true)} className="h-9 rounded-xl">
        <Upload />
        Upload
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="gap-5 p-6 sm:max-w-lg sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-lg">Upload to the library</DialogTitle>
            <DialogDescription>
              Files go to your Google Drive, in {UPLOADS_FOLDER_NAME}/{label}, and show up here
              straight away. You will be asked to sign in with Google.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <span className={AppTextStyles.EYEBROW}>Category</span>
            <Select value={category} onValueChange={setCategory} disabled={phase !== "picking"}>
              <SelectTrigger className="h-10 w-full rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UPLOAD_CATEGORIES.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="flex flex-col gap-2">
            <span className={AppTextStyles.EYEBROW}>Files</span>
            <input
              ref={input}
              type="file"
              multiple
              accept={ACCEPT}
              disabled={phase !== "picking"}
              onChange={(event) =>
                setPicked(
                  [...(event.target.files ?? [])].map((file) => ({
                    file,
                    kind: kindOfFile(file.name, file.type),
                    progress: 0,
                  })),
                )
              }
              className="rounded-xl border border-dashed border-border-soft bg-muted-surface p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-background"
            />
          </label>

          {picked.length > 0 && (
            <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto">
              {picked.map((entry, index) => (
                <li key={`${entry.file.name}-${index}`} className="flex flex-col gap-1.5 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate" title={entry.file.name}>
                      {entry.file.name}
                    </span>
                    <span className={`${AppTextStyles.CAPTION} shrink-0`}>
                      {entry.kind ? `${EFFECT_KIND_LABELS[entry.kind]} · ${sizeOf(entry.file.size)}` : "Not supported — skipped"}
                    </span>
                  </div>
                  {entry.kind && phase !== "picking" && (
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted-surface">
                      <div
                        className="h-full rounded-full transition-[width] duration-200"
                        style={{ width: `${Math.round(entry.progress * 100)}%`, backgroundColor: AppColors.EFFECTS }}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
              <XCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          {phase === "done" ? (
            <div className="flex items-center justify-between gap-3">
              <p className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="size-4" style={{ color: AppColors.EFFECTS }} />
                Uploaded to {label}.
              </p>
              <Button variant="outline" onClick={reset} className="rounded-xl">
                Upload more
              </Button>
            </div>
          ) : (
            <Button
              onClick={upload}
              disabled={phase === "uploading" || accepted.length === 0}
              className="h-10 rounded-xl"
            >
              {phase === "uploading"
                ? "Uploading…"
                : `Sign in & upload ${accepted.length || ""} ${accepted.length === 1 ? "file" : "files"}`}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

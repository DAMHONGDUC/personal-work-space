/**
 * The Google Drive calls behind uploading from the site. Browser-only.
 *
 * Reading needs only an API key: the manifest and the files it lists are
 * shared with anyone who has the link, like the rest of the library. Writing
 * needs the owner signed in with Google, through Google Identity Services — a
 * static site has no server to hold a secret, so the token lives in this page's
 * memory for as long as Google lets it, and nowhere else.
 *
 * Both values are public by design — they ship in the page — and come from the
 * environment so a fork does not upload into someone else's Drive:
 * NEXT_PUBLIC_GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_API_KEY.
 */
import {
  UPLOADS_FOLDER_NAME,
  UPLOADS_MANIFEST_NAME,
  UPLOADS_ROOT_ID,
  emptyManifest,
  parseManifest,
  type UploadsManifest,
} from "@/lib/effect-uploads";

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? "";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const DRIVE = "https://www.googleapis.com/drive/v3";
const UPLOAD = "https://www.googleapis.com/upload/drive/v3";
const FOLDER_MIME = "application/vnd.google-apps.folder";
/**
 * Full Drive access: the upload folder sits inside a folder the owner made by
 * hand, which the narrower drive.file scope cannot write into.
 */
const SCOPE = "https://www.googleapis.com/auth/drive";

/** Whether uploads can be read at all — without a key there is nothing to fetch. */
export const canReadUploads = API_KEY !== "";
/** Whether the Upload button is offered. */
export const canUpload = canReadUploads && CLIENT_ID !== "";

type TokenResponse = { access_token?: string; expires_in?: number; error?: string };
type TokenClient = {
  callback: (response: TokenResponse) => void;
  requestAccessToken: (options?: { prompt?: string }) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type: string; message?: string }) => void;
          }): TokenClient;
        };
      };
    };
  }
}

let gisLoading: Promise<void> | null = null;
let tokenClient: TokenClient | null = null;
let token: { value: string; expiresAt: number } | null = null;
let rejectSignIn: ((error: Error) => void) | null = null;

/**
 * Loads Google's sign-in script. Called when the upload dialog opens, not on
 * the click: the sign-in popup has to open inside the click itself, or the
 * browser blocks it, so the script must already be there by then.
 */
export function prepareSignIn(): Promise<void> {
  gisLoading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gisLoading = null;
      reject(new Error("Could not load Google sign-in."));
    };
    document.head.appendChild(script);
  });
  return gisLoading;
}

/** An access token, asking the owner to sign in if there is none still valid. */
export function signIn(): Promise<string> {
  if (token && token.expiresAt > Date.now() + 60_000) return Promise.resolve(token.value);

  const oauth = window.google?.accounts.oauth2;
  if (!oauth) return Promise.reject(new Error("Google sign-in is still loading — try again."));

  return new Promise((resolve, reject) => {
    // The client is made once, so its error handler reaches the current
    // request through this rather than the first request's reject.
    rejectSignIn = reject;
    tokenClient ??= oauth.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPE,
      callback: () => {},
      error_callback: (error) => rejectSignIn?.(new Error(error.message ?? `Sign-in ${error.type}.`)),
    });
    tokenClient.callback = (response) => {
      if (!response.access_token) {
        reject(new Error(response.error ?? "Sign-in was cancelled."));
        return;
      }
      token = {
        value: response.access_token,
        expiresAt: Date.now() + (response.expires_in ?? 3600) * 1000,
      };
      resolve(token.value);
    };
    tokenClient.requestAccessToken({ prompt: "" });
  });
}

async function drive<T>(url: string, init: RequestInit = {}, accessToken?: string): Promise<T> {
  const target = new URL(url);
  if (!accessToken) target.searchParams.set("key", API_KEY);

  const response = await fetch(target, {
    cache: "no-store",
    ...init,
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Google Drive answered ${response.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }

  return (response.headers.get("content-type")?.includes("json") ? response.json() : response.text()) as Promise<T>;
}

/** Drive's query language quotes with single quotes. */
function quote(value: string): string {
  return `'${value.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
}

async function findChild(
  parentId: string,
  name: string,
  accessToken?: string,
  folder = false,
): Promise<string | null> {
  const q = [
    `${quote(parentId)} in parents`,
    `name = ${quote(name)}`,
    "trashed = false",
    folder ? `mimeType = ${quote(FOLDER_MIME)}` : `mimeType != ${quote(FOLDER_MIME)}`,
  ].join(" and ");
  const params = new URLSearchParams({ q, fields: "files(id)", pageSize: "1" });
  const { files } = await drive<{ files: { id: string }[] }>(`${DRIVE}/files?${params}`, {}, accessToken);

  return files[0]?.id ?? null;
}

/** The manifest's file id and contents; an empty manifest if none exists yet. */
export async function readUploads(
  accessToken?: string,
): Promise<{ fileId: string | null; manifest: UploadsManifest }> {
  const fileId = await findChild(UPLOADS_ROOT_ID, UPLOADS_MANIFEST_NAME, accessToken);
  if (!fileId) return { fileId: null, manifest: emptyManifest() };

  const raw = await drive<unknown>(`${DRIVE}/files/${fileId}?alt=media`, {}, accessToken);
  return { fileId, manifest: parseManifest(typeof raw === "string" ? JSON.parse(raw) : raw) };
}

async function ensureFolder(parentId: string, name: string, accessToken: string): Promise<string> {
  const existing = await findChild(parentId, name, accessToken, true);
  if (existing) return existing;

  const created = await drive<{ id: string }>(
    `${DRIVE}/files?fields=id`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, mimeType: FOLDER_MIME, parents: [parentId] }),
    },
    accessToken,
  );
  return created.id;
}

/** `My uploads/<category label>`, made on first use. */
export async function uploadFolderFor(categoryLabel: string, accessToken: string): Promise<string> {
  const uploads = await ensureFolder(UPLOADS_ROOT_ID, UPLOADS_FOLDER_NAME, accessToken);
  return ensureFolder(uploads, categoryLabel, accessToken);
}

/** Readable by anyone with the link, which thumbnails and the player need. */
async function shareWithAnyone(fileId: string, accessToken: string): Promise<void> {
  await drive(
    `${DRIVE}/files/${fileId}/permissions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    },
    accessToken,
  );
}

/**
 * Uploads one file with a resumable upload — effects are often videos far past
 * the 5 MB a simple upload takes — reporting progress from 0 to 1.
 */
export async function uploadFile(
  file: File,
  parentId: string,
  accessToken: string,
  onProgress: (fraction: number) => void,
): Promise<{ id: string; name: string }> {
  const mimeType = file.type || "application/octet-stream";
  const start = await fetch(`${UPLOAD}/files?uploadType=resumable&fields=id,name`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": mimeType,
      "X-Upload-Content-Length": String(file.size),
    },
    body: JSON.stringify({ name: file.name, mimeType, parents: [parentId] }),
  });
  const session = start.headers.get("Location");
  if (!start.ok || !session) {
    throw new Error(`Google Drive would not start the upload (${start.status}).`);
  }

  // XMLHttpRequest rather than fetch: fetch still reports no upload progress.
  const uploaded = await new Promise<{ id: string; name: string }>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", session);
    request.setRequestHeader("Content-Type", mimeType);
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve(JSON.parse(request.responseText));
      else reject(new Error(`Upload of ${file.name} failed (${request.status}).`));
    };
    request.onerror = () => reject(new Error(`Upload of ${file.name} was interrupted.`));
    request.send(file);
  });

  await shareWithAnyone(uploaded.id, accessToken);
  onProgress(1);
  return uploaded;
}

/** Writes the manifest back, creating and sharing it the first time. */
export async function writeUploads(
  fileId: string | null,
  manifest: UploadsManifest,
  accessToken: string,
): Promise<string> {
  const body = `${JSON.stringify(manifest, null, 2)}\n`;

  if (fileId) {
    await drive(
      `${UPLOAD}/files/${fileId}?uploadType=media`,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body },
      accessToken,
    );
    return fileId;
  }

  const boundary = `effects-${Date.now()}`;
  const metadata = {
    name: UPLOADS_MANIFEST_NAME,
    mimeType: "application/json",
    parents: [UPLOADS_ROOT_ID],
  };
  const created = await drive<{ id: string }>(
    `${UPLOAD}/files?uploadType=multipart&fields=id`,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: [
        `--${boundary}`,
        "Content-Type: application/json; charset=UTF-8",
        "",
        JSON.stringify(metadata),
        `--${boundary}`,
        "Content-Type: application/json",
        "",
        body,
        `--${boundary}--`,
      ].join("\r\n"),
    },
    accessToken,
  );
  await shareWithAnyone(created.id, accessToken);
  return created.id;
}

import source from "@/data/project-media.json";

/**
 * What a project is shown with, wherever it is shown: the Upwork tab and the
 * portfolio read the same entry, so a new cover or video is changed once.
 */
export type ProjectMedia = {
  /** A 4:3 cover under `public/`, leading slash included: Upwork's portfolio cover. */
  cover: string;
  /** The demo video, as a `https://youtu.be/<id>` link. */
  youtube: string;
};

/**
 * `ResourceConstant.PROJECT_MEDIA_FILE`, keyed by the project's name as the
 * CV writes it, or by its Upwork title for a project the CV does not list.
 */
export const projectMedia: Record<string, ProjectMedia> = source;

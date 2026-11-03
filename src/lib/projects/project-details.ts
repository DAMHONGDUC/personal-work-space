import source from "@/data/project-details.json";

/**
 * What a project is shown with, wherever it is shown: the Upwork tab and the
 * portfolio read the same entry, so its points, cover and video are changed once.
 */
export type ProjectDetails = {
  /** Short points, one line each: what it is, what it does, then its stack last. */
  highlights: string[];
  /** A 4:3 cover under `public/`, leading slash included: Upwork's portfolio cover. */
  cover: string;
  /** The demo video on YouTube, in the projects playlist. */
  youtube: string;
};

/** Longest a highlight may be: one line on a card and in Upwork's box. */
export const HIGHLIGHT_MAX = 60;

/**
 * `ResourceConstant.PROJECT_DETAILS_FILE`, keyed by the project's name as the
 * CV writes it, or by its Upwork title for a project the CV does not list.
 */
export const projectDetails: Record<string, ProjectDetails> = source;

/**
 * Every path this project reads content from or writes build output to.
 *
 * The paths were spread across the loaders, the build scripts and the tests,
 * which is how a data file gets renamed in one place and missed in another.
 * They are declared once here instead.
 *
 * Two rules keep this file importable from everywhere it is needed:
 *
 * - **Repo-relative strings, no imports.** The commands all run from the repo
 *   root, so callers join with `process.cwd()` themselves. Importing `node:path`
 *   here would make the file unusable from anything bundled for the browser.
 * - **`.mts`.** The CV build scripts are plain Node with no `@/` alias, and
 *   they import this by relative path with its extension.
 */
export class ResourceConstant {
  /** One JSON file per app; the loader reads the whole directory. */
  static readonly APPS_DIR = "src/data/apps";

  /**
   * Guides, as `<lang>/<slug>_<lang>.json` — one folder per language, the same
   * slugs under each, and the language repeated in the filename so an editor
   * tab shows it. The loader reads the folders rather than a list.
   */
  static readonly DOCS_DIR = "src/data/docs";

  /**
   * One JSON file per pack — a top-level folder of the shared Drive — listing
   * its files. Written by `npm run effects:sync`; the name and category in each
   * are hand-edited and survive a sync.
   */
  static readonly EFFECTS_DIR = "src/data/effects";

  /** The Drive folder the packs are read from, and the categories they sort into. */
  static readonly EFFECT_LIBRARY_FILE = "src/data/effect-library.json";

  /** Publisher details and the privacy-policy sections every app shares. */
  static readonly SITE_FILE = "src/data/site.json";

  /**
   * The portfolio page: introduction, skills, experience, projects. One file,
   * imported statically by `src/lib/portfolio/portfolio.ts`.
   */
  static readonly PORTFOLIO_FILE = "src/data/portfolio.json";

  /**
   * Every CV, one JSON file per version, each cut for a different reader. The
   * build compiles all of them and the CV page offers them in a switcher, so
   * adding a file here adds an entry to the dropdown.
   *
   * A filename is the version's slug, and so is its URL under public/cv.
   */
  static readonly CV_DATA_DIR = "src/data/cv";

  /**
   * What every version has in common — header, about me, education, skills,
   * projects and the pool of jobs — one JSON file each. Merged into each
   * version before anything renders; a subfolder, so it is never mistaken for
   * a version.
   */
  static readonly CV_SHARED_DIR = "src/data/cv/shared";

  /**
   * The portfolio's own version, in the same format as a CV file: which jobs
   * it shows, merged with the shared parts. A subfolder, so it is never
   * offered as a CV.
   */
  static readonly PORTFOLIO_CV_FILE = "src/data/cv/portfolio/portfolio.json";

  /**
   * The CV shown first, and the one served at the legacy /cv.pdf. Other files
   * beside it are equally valid CVs — this constant only decides which one a
   * visitor lands on and which one an old link resolves to.
   */
  static readonly CV_DATA_FILE = "src/data/cv/cv_with_freelancer.json";

  /** `cv_normal.json` -> `cv_normal`, the slug a version is addressed by everywhere. */
  static cvSlug(file: string): string {
    return file.replace(/^.*\//, "").replace(/\.json$/, "");
  }

  /** The default version's slug, for picking it out of the built set. */
  static readonly DEFAULT_CV_SLUG = ResourceConstant.cvSlug(
    ResourceConstant.CV_DATA_FILE,
  );

  /** The LaTeX the CV is rendered into. Hand-edited; never generated. */
  static readonly CV_TEMPLATE_DIR = "cv/template";

  /**
   * Images the CV embeds, such as the photo named in the CV data, copied into
   * the LaTeX build for the PDF. It sits in public/personal beside the
   * portfolio's own portrait, which is a different file.
   */
  static readonly CV_ASSETS_DIR = "public/personal";

  /** Generated LaTeX and the PDF LaTeX produces, one folder per CV. Not in git. */
  static readonly CV_BUILD_DIR = "cv/build";

  /** Where one CV's generated main.tex and main.pdf live. */
  static cvBuildDir(slug: string): string {
    return `${ResourceConstant.CV_BUILD_DIR}/${slug}`;
  }

  /** Served at the site root, so a URL is a path here minus this prefix. */
  static readonly PUBLIC_DIR = "public";

  /**
   * The default CV, at the address the app store listings and any existing
   * link already point at. A copy of that version's file below, kept so those
   * links keep resolving. A build artifact.
   */
  static readonly CV_PDF_FILE = "public/cv.pdf";

  /** One folder per CV, holding its PDF and its page images. */
  static readonly CV_PAGES_DIR = "public/cv";

  /** Where one CV's published PDF and page images live. */
  static cvPublicDir(slug: string): string {
    return `${ResourceConstant.CV_PAGES_DIR}/${slug}`;
  }

  /** One CV's downloadable PDF. */
  static cvPdfFile(slug: string): string {
    return `${ResourceConstant.cvPublicDir(slug)}/cv.pdf`;
  }

  // Static members only: the class is a namespace for the constants, and there
  // is nothing to construct.
  private constructor() {}
}

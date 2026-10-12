import type { HtmlBlock as HtmlBlockData } from "@/lib/docs/doc-model";
import { AppColors } from "@/lib/design/app-colors";

/**
 * Markdown from another repo, as the HTML `npm run docs:sync` rendered it.
 *
 * The HTML is the site's own build output, written from the owner's Markdown
 * and committed, never anything a visitor typed, so it is drawn as it is. Its
 * look comes from the `.md-body` rules in globals.css; the colours the code
 * picks are handed over here as variables, the way the diagrams take theirs.
 */
export function HtmlBlock({ block, accent }: { block: HtmlBlockData; accent: string }) {
  return (
    <div
      className="md-body mt-5 min-w-0 first:mt-0"
      style={
        {
          "--md-accent": accent,
          "--md-tag-new": AppColors.MARKDOWN_TAGS.new,
          "--md-tag-edit": AppColors.MARKDOWN_TAGS.edit,
          "--md-tag-replace": AppColors.MARKDOWN_TAGS.replace,
          "--md-tag-check": AppColors.MARKDOWN_TAGS.check,
        } as React.CSSProperties
      }
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}

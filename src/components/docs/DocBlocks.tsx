import { Bullets } from "@/components/policy/Bullets";
import { Prose } from "@/components/policy/Prose";
import { Callout } from "@/components/docs/Callout";
import { CodeSample } from "@/components/docs/CodeSample";
import { DocTable } from "@/components/docs/DocTable";
import { FlowDiagram } from "@/components/docs/FlowDiagram";
import type { Block, Lang } from "@/lib/docs/doc-model";
import { AppColors } from "@/lib/design/app-colors";

/**
 * Renders one section's blocks in order. Every block type in `Block` is handled
 * here, so a new type added to the union fails the build until it is drawn.
 *
 * `lang` is only here for the diagrams: the dialog behind a diagram box opens in
 * a portal, outside the `main` that carries the language of the body, so it has
 * to be told which language its text is in.
 */
export function DocBlocks({
  blocks,
  accent,
  lang,
}: {
  blocks: Block[];
  accent: string;
  lang: Lang;
}) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <h3
                key={index}
                className="mt-8 text-base font-semibold tracking-tight first:mt-0"
              >
                {block.text}
              </h3>
            );

          case "text":
            return (
              <div key={index} className="mt-5 first:mt-0">
                <Prose paragraphs={block.body} />
              </div>
            );

          case "list":
            return <Bullets key={index} items={block.items} accent={accent} />;

          case "checklist":
            return <Checklist key={index} items={block.items} accent={accent} />;

          case "steps":
            return <Steps key={index} items={block.items} accent={accent} />;

          case "code":
            return <CodeSample key={index} block={block} />;

          case "table":
            return <DocTable key={index} block={block} accent={accent} />;

          case "note":
            return <Callout key={index} block={block} />;

          case "flow":
            return (
              <FlowDiagram key={index} block={block} accent={accent} lang={lang} />
            );
        }
      })}
    </>
  );
}

/**
 * A list of things to tick off. The boxes are drawn, not `<input>`s: the page is
 * statically exported and nothing stores the answers, so a control that forgot
 * every tick on reload would be worse than no control at all.
 */
function Checklist({ items, accent }: { items: string[]; accent: string }) {
  return (
    <ul className="mt-5 flex max-w-[68ch] flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-base leading-7">
          <span
            aria-hidden
            className="mt-1.5 size-4 shrink-0 rounded-[0.3rem] border"
            style={{ borderColor: `${AppColors.tint(accent, 45)}` }}
          />
          <span className="text-muted">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Numbered steps, for the places where the order is the point. */
function Steps({ items, accent }: { items: string[]; accent: string }) {
  return (
    <ol className="mt-5 flex max-w-[68ch] flex-col gap-3">
      {items.map((item, index) => (
        <li key={item} className="flex gap-3.5 text-base leading-7">
          <span
            aria-hidden
            className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${AppColors.tint(accent, 14)}`,
              color: accent,
            }}
          >
            {index + 1}
          </span>
          <span className="text-muted">{item}</span>
        </li>
      ))}
    </ol>
  );
}

import { PORTFOLIO_SECTIONS } from "@/lib/portfolio/portfolio-model";
import { AppTextStyles } from "@/lib/design/app-text-styles";

/** The page's contents as a row of links, built from the same list as the headings. */
export function SectionNav() {
  return (
    <nav aria-label="On this page">
      <ul className={`${AppTextStyles.SMALL} flex flex-wrap gap-x-6 gap-y-2`}>
        {PORTFOLIO_SECTIONS.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`} className="transition-colors hover:text-foreground">
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

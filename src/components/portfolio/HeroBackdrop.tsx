/**
 * The texture behind the hero: a dot grid that fades out from the top and a
 * film of grain. No colour of its own — the page's colour is in its content.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-16 bottom-0 overflow-hidden">
      <div className="pf-dots absolute inset-0" />
      <div className="pf-grain absolute inset-0 opacity-[0.05] mix-blend-overlay" />
    </div>
  );
}

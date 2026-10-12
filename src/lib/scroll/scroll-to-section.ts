/**
 * Scrolls to a section of the current page, for the contents lists.
 *
 * A plain `#id` link leaves the move to the browser's smooth scrolling, which
 * aims at where the section is when the click lands. When the page grows
 * under it — an image above the section finishing loading — the animation
 * stops short; where smooth scrolling does not run at all, nothing moves. So
 * this starts the scroll itself, waits for the page to settle, and if the
 * section is not where it should be, jumps the rest of the way.
 */

/** How often the page is checked while the scroll runs. */
const POLL_MS = 100;

/** The scroll counts as finished once the offset holds for this many checks. */
const SETTLED_POLLS = 2;

/** Give up waiting after this long and settle wherever the page is. */
const MAX_MS = 2000;

/** Browsers report fractional offsets on scaled displays; this close is in place. */
const TOLERANCE = 2;

/** Any of these from the reader means they took over, and the page is theirs. */
const READER_INPUT = ["wheel", "touchstart", "keydown", "mousedown"] as const;

/** Where the section's top should rest: below the sticky header, by the page's own offsets. */
function restingTop(target: HTMLElement): number {
  const page = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const own = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  return page + own;
}

function atBottom(): boolean {
  return Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight;
}

/**
 * Scrolls to the element with `id` and puts `#id` in the address, as the link
 * would have. Returns false when there is no such element, so the caller can
 * let the link behave normally. `onSettled` runs once the page has come to
 * rest there, or the reader took over.
 */
export function scrollToSection(id: string, onSettled?: () => void): boolean {
  const target = document.getElementById(id);
  if (!target) return false;

  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  // Keep the router's state on the entry, so Back still works the router's way.
  window.history.pushState(window.history.state, "", `#${id}`);

  let lastY = window.scrollY;
  let still = 0;
  let waited = 0;
  let timer = 0;

  const stop = () => {
    window.clearTimeout(timer);
    for (const type of READER_INPUT) window.removeEventListener(type, stop);
    onSettled?.();
  };
  for (const type of READER_INPUT) window.addEventListener(type, stop, { passive: true });

  const check = () => {
    waited += POLL_MS;
    still = Math.abs(window.scrollY - lastY) <= TOLERANCE ? still + 1 : 0;
    lastY = window.scrollY;

    if (still < SETTLED_POLLS && waited < MAX_MS) {
      timer = window.setTimeout(check, POLL_MS);
      return;
    }

    const off = Math.abs(target.getBoundingClientRect().top - restingTop(target)) > TOLERANCE;
    if (off && !atBottom()) target.scrollIntoView({ behavior: "instant", block: "start" });
    stop();
  };
  timer = window.setTimeout(check, POLL_MS);

  return true;
}

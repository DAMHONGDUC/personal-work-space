/**
 * Copies text to the clipboard, and says whether it worked so a copy button
 * says "Copied" only when it did.
 *
 * The clipboard API needs a secure page and a focused one; where it refuses —
 * an embedded browser, an unfocused window — the older select-and-copy route
 * still works inside the click that asked for it.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyBySelection(text);
  }
}

function copyBySelection(text: string): boolean {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  // Off screen, so the page does not jump or flash while it is selected.
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
  }
}

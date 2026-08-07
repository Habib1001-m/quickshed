/**
 * Copy text and report whether the browser accepted the copy operation.
 *
 * Clipboard API failures are common outside secure contexts and when a
 * browser denies permission, so keep the legacy fallback local to the page.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the local document fallback.
    }
  }

  return copyTextWithExecCommand(text);
}

/**
 * Read text from the browser clipboard without exposing the API to callers.
 * A denied or unavailable read is represented by null so an empty clipboard
 * remains distinguishable from a failed permission check.
 */
export async function readTextFromClipboard(): Promise<string | null> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
    return null;
  }

  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

function copyTextWithExecCommand(text: string): boolean {
  if (typeof document === 'undefined' || !document.body) return false;

  const textArea = document.createElement('textarea');
  const activeElement = document.activeElement as HTMLElement | null;
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.setAttribute('aria-hidden', 'true');
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '-9999px';
  textArea.style.opacity = '0';
  textArea.style.pointerEvents = 'none';

  let copied = false;
  try {
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    copied = document.execCommand('copy');
  } catch {
    // The fallback is unavailable or was denied by the browser.
  } finally {
    textArea.parentNode?.removeChild(textArea);
    try {
      activeElement?.focus();
    } catch {
      // Restoring focus is best effort and does not affect copy success.
    }
  }

  return copied;
}

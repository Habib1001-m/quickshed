import { normalizeHistoryEntries, MAX_HISTORY_ENTRIES, type ToolHistoryEntry } from '@/lib/storage-shapes';

// Re-export so existing `import { type ToolHistoryEntry } from '@/lib/tool-history'`
// sites keep working; the canonical type lives in src/lib/storage-shapes.
export type { ToolHistoryEntry };

const TOOL_HISTORY_KEY = 'quickshed-tool-history';

/** Pick a collision-free id when appending a new entry. */
function getUniqueHistoryId(
  baseId: string,
  preferredId: unknown,
  usedIds: Set<string>,
): string {
  let entryId = typeof preferredId === 'string' && !usedIds.has(preferredId)
    ? preferredId
    : baseId;
  let suffix = 1;
  while (usedIds.has(entryId)) {
    entryId = `${baseId}-${suffix}`;
    suffix += 1;
  }
  usedIds.add(entryId);
  return entryId;
}

function readFromStorage(): ToolHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(TOOL_HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return normalizeHistoryEntries(parsed);
    }
  } catch {
    // localStorage not available or invalid JSON
  }
  return [];
}

function writeToStorage(entries: ToolHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TOOL_HISTORY_KEY, JSON.stringify(entries));
  } catch {
    // localStorage not available
  }
}

/** Get history entries sorted by most recent */
export function getToolHistory(): ToolHistoryEntry[] {
  const entries = readFromStorage();
  return entries.sort((a, b) => b.timestamp - a.timestamp);
}

/** Add entry (called when a tool is used) */
export function addToolHistoryEntry(toolId: string): void {
  const entries = readFromStorage();
  const timestamp = Date.now();
  const usedIds = new Set(entries.map((entry) => entry.id));
  const id = getUniqueHistoryId(`${toolId}-${timestamp}`, undefined, usedIds);
  const updated = [{ id, toolId, timestamp }, ...entries].slice(0, MAX_HISTORY_ENTRIES);
  writeToStorage(updated);
}

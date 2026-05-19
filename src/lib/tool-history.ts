const TOOL_HISTORY_KEY = 'quickshed-tool-history';
const MAX_HISTORY_ENTRIES = 200;

export interface ToolHistoryEntry {
  toolId: string;
  timestamp: number; // Unix timestamp
}

function readFromStorage(): ToolHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(TOOL_HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
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
  const updated = [{ toolId, timestamp: Date.now() }, ...entries].slice(0, MAX_HISTORY_ENTRIES);
  writeToStorage(updated);
}

/** Clear all history */
export function clearToolHistory(): void {
  writeToStorage([]);
}

/** Search history by tool name (match against toolId) */
export function searchToolHistory(query: string): ToolHistoryEntry[] {
  if (!query.trim()) return getToolHistory();
  const lower = query.toLowerCase();
  const entries = getToolHistory();
  return entries.filter((entry) => entry.toolId.toLowerCase().includes(lower));
}

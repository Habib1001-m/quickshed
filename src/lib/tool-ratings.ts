import { normalizeRatings, safeJsonParse, type ToolRatingData } from '@/lib/storage-shapes';

const TOOL_RATINGS_KEY = 'quickshed-tool-ratings';

// Canonical type lives in src/lib/storage-shapes; re-exported for back-compat.
export type { ToolRatingData };

/**
 * Save a local rating for a tool (1-5 stars). Overwrites any previous rating
 * on this device.
 */
export function saveRating(toolId: string, rating: number): void {
  if (typeof window === 'undefined') return;
  if (rating < 1 || rating > 5) return;
  try {
    const all = getAllRatingsRaw();
    all[toolId] = { rating, timestamp: Date.now() };
    localStorage.setItem(TOOL_RATINGS_KEY, JSON.stringify(all));
  } catch {
    // localStorage not available
  }
}

/**
 * Remove a tool's local rating from this device.
 */
export function removeRating(toolId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const all = getAllRatingsRaw();
    if (!Object.prototype.hasOwnProperty.call(all, toolId)) return;

    delete all[toolId];
    if (Object.keys(all).length === 0) {
      localStorage.removeItem(TOOL_RATINGS_KEY);
    } else {
      localStorage.setItem(TOOL_RATINGS_KEY, JSON.stringify(all));
    }
  } catch {
    // localStorage not available
  }
}

/**
 * Get the current user's rating for a tool (1-5), or 0 if unrated.
 */
export function getRating(toolId: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const all = getAllRatingsRaw();
    return all[toolId]?.rating || 0;
  } catch {
    return 0;
  }
}

/**
 * Get all ratings as a record of toolId -> ToolRatingData.
 */
export function getAllRatings(): Record<string, ToolRatingData> {
  if (typeof window === 'undefined') return {};
  try {
    return getAllRatingsRaw();
  } catch {
    return {};
  }
}

/**
 * Get the local toolId -> rating map for this-device sorting purposes.
 */
export function getRatingsMap(): Record<string, number> {
  const all = getAllRatings();
  const map: Record<string, number> = {};
  for (const [toolId, data] of Object.entries(all)) {
    map[toolId] = data.rating;
  }
  return map;
}

// ─── Internal helpers ────────────────────────────────────────────────

function getAllRatingsRaw(): Record<string, ToolRatingData> {
  try {
    return normalizeRatings(safeJsonParse(localStorage.getItem(TOOL_RATINGS_KEY)));
  } catch {
    // localStorage not available or invalid JSON
  }
  return {};
}

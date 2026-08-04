import { normalizeRatings, safeJsonParse, type ToolRatingData } from '@/lib/storage-shapes';

const TOOL_RATINGS_KEY = 'quickshed-tool-ratings';

// Canonical type lives in src/lib/storage-shapes; re-exported for back-compat.
export type { ToolRatingData };

/**
 * Save a rating for a tool (1-5 stars). Overwrites any previous rating by the same user.
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
 * Get a map of toolId -> rating for sorting purposes.
 */
export function getRatingsMap(): Record<string, number> {
  const all = getAllRatings();
  const map: Record<string, number> = {};
  for (const [toolId, data] of Object.entries(all)) {
    map[toolId] = data.rating;
  }
  return map;
}

/**
 * Get the total number of ratings (count of rated tools).
 */
export function getRatingCount(toolId: string): number {
  const all = getAllRatings();
  return all[toolId] ? 1 : 0;
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

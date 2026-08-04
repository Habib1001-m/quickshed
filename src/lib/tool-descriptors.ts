/**
 * Static client-facing tool metadata.
 *
 * `content/tools-index.json` is validated against the full ToolSchema by
 * `scripts/validate-tools.mjs` before the production release gate/build. Keep
 * that validation authoritative: this module is deliberately data-only so
 * client consumers do not import the runtime validator or Zod.
 *
 * The assertion is intentionally isolated here at the validated static-data
 * boundary. The JSON module's inferred string properties cannot express the
 * closed unions derived from ToolSchema, while the release validator checks
 * the complete runtime shape, source/index parity, routes, components, and
 * bilingual metadata before this data is consumed.
 */
import toolsIndex from '../../content/tools-index.json';
import type { Tool } from './tool-schema';

export const TOOL_DESCRIPTORS = toolsIndex as unknown as Tool[];

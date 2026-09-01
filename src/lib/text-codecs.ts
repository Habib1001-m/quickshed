const HTML_ENTITY_PATTERN = /&(?:amp|lt|gt|quot|apos|#(?:\d+|x[\da-f]+));/gi;

const NAMED_HTML_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
};

function decodeNumericEntity(entity: string): string {
  const normalized = entity.slice(1, -1).toLowerCase();
  const codePoint = normalized.startsWith('#x')
    ? Number.parseInt(normalized.slice(2), 16)
    : Number.parseInt(normalized.slice(1), 10);

  if (
    !Number.isInteger(codePoint) ||
    codePoint < 0 ||
    codePoint > 0x10ffff ||
    (codePoint >= 0xd800 && codePoint <= 0xdfff)
  ) {
    return entity;
  }

  return String.fromCodePoint(codePoint);
}

export function decodeHtmlEntities(text: string): string {
  return text.replace(HTML_ENTITY_PATTERN, (entity) => {
    const normalized = entity.slice(1, -1).toLowerCase();
    return normalized.startsWith('#')
      ? decodeNumericEntity(entity)
      : NAMED_HTML_ENTITIES[normalized] ?? entity;
  });
}

export function encodeBase64Unicode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

export function decodeBase64Unicode(text: string): string | null {
  try {
    const binary = atob(text);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export function canonicalizeJsonValue(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalizeJsonValue);
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalizeJsonValue(value[key])]),
    );
  }

  return value;
}

export function areJsonValuesEqual(left, right) {
  return (
    JSON.stringify(canonicalizeJsonValue(left)) ===
    JSON.stringify(canonicalizeJsonValue(right))
  );
}

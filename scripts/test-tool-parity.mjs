import assert from 'node:assert/strict';

import {
  areJsonValuesEqual,
  canonicalizeJsonValue,
} from './tool-parity.mjs';

const source = {
  id: 'nested-order',
  metadata: {
    labels: {
      primary: 'tool',
      secondary: 'local',
    },
    flags: [
      { enabled: true, name: 'offline' },
      { enabled: false, name: 'experimental' },
    ],
  },
  steps: ['first', 'second'],
};

const reordered = {
  steps: ['first', 'second'],
  metadata: {
    flags: [
      { name: 'offline', enabled: true },
      { name: 'experimental', enabled: false },
    ],
    labels: {
      secondary: 'local',
      primary: 'tool',
    },
  },
  id: 'nested-order',
};

assert.deepEqual(canonicalizeJsonValue(source), canonicalizeJsonValue(reordered));
assert.equal(
  areJsonValuesEqual(source, reordered),
  true,
  'reordered nested object keys should be considered equal',
);

const valueMismatch = structuredClone(reordered);
valueMismatch.metadata.labels.primary = 'different';
assert.equal(
  areJsonValuesEqual(source, valueMismatch),
  false,
  'a nested value mismatch should not be considered equal',
);

const arrayOrderMismatch = structuredClone(reordered);
arrayOrderMismatch.steps.reverse();
assert.equal(
  areJsonValuesEqual(source, arrayOrderMismatch),
  false,
  'array order should remain meaningful',
);

console.log('Tool parity helper passed reordered-key, value-mismatch, and array-order checks.');

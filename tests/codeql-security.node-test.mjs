import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  decodeBase64Unicode,
  decodeHtmlEntities,
  encodeBase64Unicode,
} from '../src/lib/text-codecs.ts';
import {
  getBlogPostHref,
  isSafeBlogLocale,
  isSafeBlogSlug,
} from '../src/lib/blog-slug.ts';

test('HTML entity decoding is deterministic and single-pass', () => {
  assert.equal(
    decodeHtmlEntities('&lt;script&gt;alert(1)&lt;/script&gt;'),
    '<script>alert(1)</script>',
  );
  assert.equal(decodeHtmlEntities('&amp;lt;script&amp;gt;'), '&lt;script&gt;');
  assert.equal(decodeHtmlEntities('&amp;quot;'), '&quot;');
  assert.equal(decodeHtmlEntities('&#60;img src=x onerror=alert(1)&#62;'), '<img src=x onerror=alert(1)>');
  assert.equal(decodeHtmlEntities('&#x3C;svg onload=alert(1)&#x3E;'), '<svg onload=alert(1)>');
  assert.equal(decodeHtmlEntities('مرحبا بالعالم'), 'مرحبا بالعالم');
});

test('Base64 Unicode round trips and invalid input returns null', () => {
  const text = 'مرحبا 🌍';
  const encoded = encodeBase64Unicode(text);

  assert.equal(decodeBase64Unicode(encoded), text);
  assert.equal(decodeBase64Unicode('%%%not-base64%%%'), null);
});

test('blog links accept canonical slugs and reject unsafe segments', () => {
  assert.equal(isSafeBlogLocale('en'), true);
  assert.equal(isSafeBlogLocale('ar'), true);
  assert.equal(isSafeBlogLocale('../en'), false);
  assert.equal(isSafeBlogSlug('custom-pdf-tools-guide'), true);
  assert.equal(isSafeBlogSlug('welcome-to-quickshed'), true);

  for (const slug of [
    'a/b',
    '..',
    '"quoted"',
    '<script>',
    '%2Fencoded-separator',
    'https://example.invalid',
    'line\nfeed',
  ]) {
    assert.equal(isSafeBlogSlug(slug), false, slug);
    assert.equal(getBlogPostHref('en', slug), null, slug);
  }

  assert.equal(
    getBlogPostHref('en', 'custom-pdf-tools-guide'),
    '/en/blog/custom-pdf-tools-guide',
  );
  assert.equal(getBlogPostHref('ar', 'welcome-to-quickshed'), '/ar/blog/welcome-to-quickshed');
  assert.equal(getBlogPostHref('javascript:alert(1)', 'safe-slug'), null);
});

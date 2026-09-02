# QuickShed

QuickShed is a free, privacy-first browser toolbox with 90 tools across 11 categories. It covers calculations, text, conversions, student work, PDFs, images, developer tasks, SEO, security, time, and everyday utilities.

Each tool page shows how that tool handles data. Read the badge before entering sensitive information.

## Data handling

QuickShed uses four data-handling classes:

- **Local**: the tool processes input in the browser and does not persist it through the tool.
- **File-only**: the tool works with the file selected in the browser and does not persist it through the tool.
- **On-device**: the tool can save selected data in browser storage for use in this browser later.
- **API**: the tool uses an external service and must disclose that transfer before it occurs.

The current catalog contains no tool descriptor that declares external API egress. The badge on the tool page is the source for that tool's handling details. Browser-local processing is separate from website availability: the service worker caches selected static assets, but it does not guarantee offline navigation.

QuickShed does not require an account and does not show ads. Browser storage is used for preferences and selected on-device tool data, such as favorites. You can clear saved data from Settings. For the full policy, see [Privacy Policy](https://quickshed.vercel.app/en/privacy).

## Tool catalog

| Category | Tools |
| --- | ---: |
| Calculators | 13 |
| Time Tools | 9 |
| Text Tools | 10 |
| Converters | 7 |
| Student Tools | 10 |
| PDF Tools | 5 |
| Utility Tools | 15 |
| SEO Tools | 5 |
| Developer Tools | 8 |
| Image Tools | 4 |
| Security Tools | 4 |
| **Total** | **90** |

Use the [All Tools](https://quickshed.vercel.app/en/all-tools) page to search the current catalog. The interface is available in English and Arabic, with left-to-right and right-to-left layouts respectively.

## Run locally

The project uses Node.js 22 in CI and npm 10.

```bash
npm ci
npm run dev
```

The development server uses port 7125. Open `http://localhost:7125/en` or `http://localhost:7125/ar`.

To run the production build locally:

```bash
npm run build
npm run start
```

The production server also uses port 7125.

## Validation

Run the narrow checks while working:

```bash
npm run lint
npm run typecheck
npm run guard:public-assets
npm run test:public-boundary
npm run test:codeql-security
npm run test:e2e
```

The release candidate gate runs the complete sequence, including the production build, critical production dependency audit, and desktop/mobile Chromium tests:

```bash
npm run release:check
```

A build or test result is not a deployment. Deployment is a separate release action.

## Project structure

- `content/tools-index.json` is the current runtime-consumed tool descriptor index.
- `content/tools/*.json` contains per-tool metadata records also maintained in the repository.
- The producer/generator relationship between these metadata surfaces is not currently established; keep overlapping records consistent.
- `src/components/tools/` contains client-side tool components loaded through the dynamic registry.
- `src/app/[locale]/` contains localized routes for the home page, categories, tools, blog, and legal pages.
- `messages/en.json` and `messages/ar.json` contain shared interface copy.
- `content/blog/en/` and `content/blog/ar/` contain the localized MDX articles.
- `public/sw.js` caches selected static assets; it does not cache navigation requests.

Known locale routes are generated from `generateStaticParams`. Unknown locale-prefixed paths return not found. The application has no account system, application backend, database, subscription, advertising, or product analytics layer.

## Add or update a tool

1. Read the schema in `src/lib/tool-schema.ts`.
2. Add or update the complete per-tool metadata record in `content/tools/` with English and Arabic names, descriptions, keywords, inputs, outputs, privacy class, offline scope, retention, risk, and data-flow evidence.
3. Keep overlapping metadata in `content/tools/` and `content/tools-index.json` consistent; do not assume that one surface generates the other.
4. Add the client component under `src/components/tools/` and register it in `src/components/tools/index.ts`.
5. Keep browser APIs and storage access inside the client boundary. Do not add network egress to a Local, File-only, or On-device tool.
6. Check English and Arabic routes, including text direction, accessible names, and mobile layout.
7. Run the relevant checks and update `CHANGELOG.md` when the change is user-visible or security-relevant.

Do not add a tool as part of an unrelated refactor. New external-service behavior needs an explicit API privacy class, destination and purpose disclosure, a consent path, and product approval before implementation.

## Documentation and policy

- [Documentation index](docs/README.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)
- [Privacy Policy](https://quickshed.vercel.app/en/privacy)
- [Terms of Service](https://quickshed.vercel.app/en/terms)
- [Dependency audit policy](docs/security/dependency-audit-policy.md)

## License

QuickShed is released under the [MIT License](LICENSE).

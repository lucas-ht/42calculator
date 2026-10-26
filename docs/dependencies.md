# Dependency maintenance

The npm manifest and both lock files were refreshed on 26 October 2026.
Dependencies use the latest stable versions, with two intentional release lines:

- `@types/node` follows the deployed Node.js 24 runtime.
- Auth.js follows the v5 beta channel because the app uses its v5 API; the npm
  `latest` tag still points at v4 and would be a downgrade.

Table v9 uses explicit expansion/visibility features and table-local metadata.
Jest uses an ESM config, so TypeScript 7 does not need the removed JavaScript
compiler API through ts-node.

The typography plugin still requests a vulnerable selector parser. Its scoped
`postcss-selector-parser` override selects 7.1.6, the patched release for
[the security advisory](https://github.com/advisories/GHSA-rj75-hqrm-r3gf).
Remove that override when typography requests a patched version itself.

## 1. Provider Documentation

- [x] 1.1 Document current basemap, geocoding, and street-data providers in the README.
- [x] 1.2 Document public-provider availability as best-effort and identify no-backend limitations.
- [x] 1.3 Add provider-policy notes near relevant configuration where helpful.

## 2. Provider Behavior

- [x] 2.1 Ensure geocoding remains explicit-submit only and never autocomplete-like.
- [x] 2.2 Ensure Overpass requests remain debounced, bounded by maximum area, and timeout-controlled.
- [x] 2.3 Ensure repeated requests reuse cached results where available before issuing new provider calls.
- [x] 2.4 Ensure provider failure messages are recoverable and preserve map usability.

## 3. Verification

- [x] 3.1 Add or update tests for provider timeout/failure behavior where practical.
- [x] 3.2 Manually verify provider failure copy for geocoding and street-data failures.
- [x] 3.3 Run `npm run test`, `npm run lint`, `npm run build`, and `openspec validate --all --strict`.

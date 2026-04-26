## 1. Timezone Strategy

- [ ] 1.1 Select a browser-side timezone lookup approach that keeps static deployment and acceptable bundle size.
- [ ] 1.2 Add the timezone dependency or local lookup module and document the source of timezone data.

## 2. Core Implementation

- [ ] 2.1 Track the active location timezone separately from browser timezone in app state.
- [ ] 2.2 Resolve timezone when browser geolocation, address selection, or map-center analysis location changes.
- [ ] 2.3 Interpret the selected date as a calendar date in the active location timezone for sunset time and azimuth.
- [ ] 2.4 Display sunset time with timezone context or a visible fallback indicator.

## 3. Verification

- [ ] 3.1 Add tests for locations whose timezone differs from the test/browser timezone.
- [ ] 3.2 Add tests for timezone lookup fallback behavior.
- [ ] 3.3 Run `npm run test`, `npm run lint`, `npm run build`, and `openspec validate --all --strict`.

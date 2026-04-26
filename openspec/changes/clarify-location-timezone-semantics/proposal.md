## Why

The current app calculates and displays sunset information using browser-local date behavior, which can be wrong when the selected map location is in another timezone. This change makes the date and sunset-time semantics explicit so users can trust results for searched or manually navigated locations.

## What Changes

- Interpret the selected calendar date in the active map location's timezone, not necessarily the browser timezone.
- Display sunset time with enough timezone context to avoid ambiguity.
- Define fallback behavior when the location timezone cannot be determined.
- Add tests for cross-timezone locations and fallback behavior.

## Capabilities

### New Capabilities

- `location-timezone`: Determining and applying the timezone for the active search location.

### Modified Capabilities

- `sunset-alignment-map`: Date selection and sunset display semantics change from browser-local assumptions to active-location timezone semantics.

## Impact

- Affects `app/src/lib/sun.ts`, date parsing, UI copy in `app/src/App.tsx`, and related tests.
- May require a browser-suitable timezone lookup strategy or a static/offline timezone approximation package.
- No custom backend is introduced.

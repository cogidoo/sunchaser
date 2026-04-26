## Why

Sunchaser currently depends directly on public Nominatim, Overpass, and hosted map tile/style services from the browser. That is acceptable for a small MVP, but production behavior, user-facing failures, usage-policy limits, and fallback expectations need to be explicit before the app is promoted as reliable.

## What Changes

- Define supported external providers for geocoding, street data, and basemap/style data.
- Define rate-limit, timeout, retry, cache, and user-facing failure behavior.
- Make provider attribution and policy constraints visible in documentation and app copy where needed.
- Decide what "production usage" means for this static app and what remains best-effort.

## Capabilities

### New Capabilities

- `external-provider-strategy`: Provider configuration, policy constraints, fallback behavior, and operational expectations.

### Modified Capabilities

- `sunset-alignment-map`: Map source attribution and street data retrieval requirements become more explicit about provider failures and production constraints.

## Impact

- Affects `app/src/config.ts`, `app/src/lib/geocoding.ts`, `app/src/lib/overpass.ts`, app status/error copy, README documentation, and tests around recoverable provider failures.
- Does not introduce a paid server or always-running backend by default.
- May introduce documented configuration hooks for swapping providers later.

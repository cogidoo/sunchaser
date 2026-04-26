## Context

The app is static and currently calls public browser-accessible providers directly: Nominatim for geocoding, Overpass for OSM street geometry, and OpenFreeMap/OSM-derived sources for basemap data. Public providers can rate-limit, reject, or change availability. The product needs clear behavior for small public usage without implying operational guarantees that the architecture does not provide.

## Goals / Non-Goals

**Goals:**

- Keep provider URLs, limits, and timeouts centralized and documented.
- Avoid behavior that violates public provider usage expectations, especially autocomplete-like geocoding.
- Make provider failures recoverable and understandable to users.
- Define acceptable cache/retry behavior for a static browser app.
- Keep a path open for future provider replacement.

**Non-Goals:**

- Building a custom backend proxy in this change.
- Paying for managed maps/geocoding by default.
- Providing uptime guarantees for public third-party providers.

## Decisions

- Treat public providers as best-effort for the current static MVP. The UI and README should say this directly rather than hiding the limitation.
- Keep direct provider calls rate-conscious: explicit geocoding submit, bounded Overpass area, request timeouts, no aggressive automatic retries.
- Centralize provider configuration in app config. This keeps future provider swaps localized.
- Prefer cache-before-retry. Browser memory caching reduces repeated calls without creating retry storms against public services.
- Surface provider failures without breaking manual map exploration or existing map state.

## Risks / Trade-offs

- Public provider limits may still affect users. Mitigation: bounded requests, explicit search, visible failure messages, and documentation.
- No backend means no centralized cache or quota control. Mitigation: keep usage modest and defer backend/proxy work to a separate change if real traffic requires it.
- Provider policy language can change. Mitigation: document provider names and review links during implementation rather than embedding assumptions in code only.

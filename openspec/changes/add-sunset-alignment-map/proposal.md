## Why

People want to discover streets near them where the sunset lines up with the street axis, creating a clear "sunset corridor" for walking, cycling, photography, and urban exploration. This change introduces a map-first way to find those alignments for today and nearby dates instead of relying on guesswork.

## What Changes

- Add a web map experience that uses the user's browser location or an entered address as the search center.
- Allow users to select a date, defaulting to today, and evaluate sunset alignment for that date.
- Render an OSM-attributed basemap using a provider suitable for browser map applications.
- Retrieve nearby OpenStreetMap street geometry for the visible map area or a bounded search area.
- Compute the sunset direction for the selected location and date.
- Highlight street segments whose bearing closely matches the sunset direction in either travel direction.
- Color-code matching segments by angular deviation from the sunset direction.
- Show basic details for a highlighted segment, including street name when available, deviation, sunset time, bearing direction, and approximate segment length.
- Defer route planning, line-of-sight validation, terrain/building occlusion, and full photography planning tools to later changes.

## Capabilities

### New Capabilities
- `sunset-alignment-map`: Finds and visualizes nearby street segments whose geometric bearing aligns with sunset for a selected date and location.

### Modified Capabilities

None.

## Impact

- Introduces a new map-based user interface.
- Requires browser geolocation support and address geocoding.
- Requires MapLibre or an equivalent map rendering library, an OSM-attributed basemap provider suitable for the expected usage, and an OSM street data source such as Overpass.
- Requires geocoding policy compliance for a static web app, including request debouncing, browser-side caching, timeouts, visible attribution, and a swappable browser-suitable provider.
- Does not require a paid server or always-running backend for the MVP.
- Requires sunset time and azimuth calculation for a location and date.
- Requires geometry utilities for bearing, distance, angular deviation, filtering, and map styling.

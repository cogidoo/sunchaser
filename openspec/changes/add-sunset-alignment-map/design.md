## Context

The project currently has no established application framework or implementation files. This change defines a first product capability: a browser-based map that helps users find street alignments where the sunset direction matches the geometric bearing of nearby streets.

The experience is map-first. Users either allow browser geolocation or enter an address, then inspect highlighted street segments for a selected date. The first version targets inspiration plus useful precision: the map highlights promising corridors, and selected segments expose exact deviation and sunset details.

The MVP must be deployable as a static web app with no paid server and no always-running backend. GitHub Pages is the intended hosting target for the first version.

## Goals / Non-Goals

**Goals:**

- Ship as a static single-page web app without requiring paid backend infrastructure.
- Provide a web map that can center on browser location or a geocoded address.
- Default the date to today while allowing users to choose another date.
- Calculate sunset time and sunset azimuth for the active location and date.
- Fetch street geometry for the active map area, constrained to a reasonable maximum area around the map center.
- Score street segments by angular deviation from the sunset azimuth, accounting for both street directions.
- Highlight matching street segments using a visual quality scale.
- Show segment details on selection.

**Non-Goals:**

- Route planning to the selected street segment.
- Guaranteeing line of sight to the physical sun across buildings, trees, hills, or temporary obstructions.
- Full photography-planning features such as golden hour windows, focal length guidance, or landmark alignment.
- Persisting user accounts, saved places, or favorite streets.
- Offline map or offline OSM data support.

## Decisions

### Use The Map View As The Primary Search Context

The active map bounds SHOULD drive which streets are considered, with a maximum bounded area to avoid oversized data requests. This supports exploration by panning and zooming while keeping external OSM queries predictable.

The MVP SHOULD cap analysis to approximately a 5 km radius around the map center or an equivalent maximum bounding-box area. If the visible map area exceeds the cap, the app should ask the user to zoom in or analyze the capped center area rather than issuing an oversized request. Map movement SHOULD be debounced, and street data SHOULD be cached by rounded map bounds to avoid repeated requests while users explore.

Alternative considered: use only a fixed 5 km radius. This is simpler but feels less natural for a map-first exploration tool.

### Start With Segment-Level Scoring

The first implementation SHOULD score individual OSM line segments or short derived segments. This is easier to implement and validate than reconstructing full urban axes from many connected ways.

Alternative considered: merge adjacent segments into longer straight corridors immediately. That produces cleaner visuals but adds topology and heuristics before the basic experience is proven.

The design should leave room for a later corridor-merging pass that groups adjacent segments with similar bearings and shared names.

### Match Either Direction Of A Street Segment

Street geometry has a bearing from point A to point B, but users can look or travel in either direction. The angular deviation calculation MUST compare the sunset azimuth against both the segment bearing and the opposite bearing, then use the smaller deviation.

### Prefer OSM-Based Data Sources

Street geometry SHOULD come from OpenStreetMap, initially through a bounded Overpass query or an equivalent OSM-backed API. The implementation should filter out unsuitable ways such as motorways and service-only infrastructure unless later product decisions include them.

Address search SHOULD use a browser-suitable OSM-compatible geocoder. The MVP should avoid an always-running proxy because the product constraint is no paid server. If public Nominatim is used directly, the app MUST stay within low-volume website usage expectations by relying on browser referrer, request debouncing, client-side caching, timeouts, limited result counts, and clear attribution. The geocoding integration SHOULD be isolated behind a small provider interface so it can later move to a proxy or another provider without changing UI behavior.

### Use MapLibre With Separate Basemap And Overlay Sources

The initial map implementation SHOULD use MapLibre GL JS or an equivalent renderer with a hosted OSM-attributed basemap style and a separate GeoJSON overlay source for computed sunset-aligned street candidates. The app MUST NOT depend on `tile.openstreetmap.org` for production usage. Candidate overlay layers should be inserted below label/symbol layers where possible so street and place labels remain readable.

Alternative considered: Leaflet with raster tiles. Leaflet is simpler, but MapLibre gives more control over vector basemaps, layer ordering, styling, and interactive GeoJSON overlays.

### Keep External Service Calls Static-App Friendly

The MVP SHOULD call external map, geocoding, and street-data services directly from the browser only when their usage policies and CORS behavior allow it. Calls SHOULD be low frequency, debounced, bounded, cached where practical, and easy to disable or replace. The app should show useful error states when shared public services reject requests or are unavailable.

The build configuration SHOULD support GitHub Pages deployment, including relative asset paths or an explicit configurable base path for repository-pages hosting.

### Use A Simple Quality Scale

The visual scale SHOULD prioritize angular deviation:

- 0-2 degrees: excellent
- 2-5 degrees: good
- 5-10 degrees: fair
- greater than 10 degrees: hidden by default

Length and proximity can be used as secondary ranking factors for lists or popup ordering, but color should remain understandable as alignment quality.

After adjacent pieces are merged into a candidate street run, the map SHOULD apply length-aware visibility thresholds so short but mathematically aligned stubs do not dominate the map:

- excellent candidates require at least 80 meters
- good candidates require at least 120 meters
- fair candidates require at least 180 meters

Line width, opacity, or legend text SHOULD supplement color so alignment quality is not conveyed by color alone.

### Interpret Dates In The Search Location Context

The selected calendar date SHOULD be interpreted for the active search location. Sunset time displayed to the user SHOULD be the local sunset time for that search location and selected date, even if the user's browser timezone differs from the searched place.

### Treat Visibility As Out Of Scope For The First Version

The app will identify geometric street-sun alignment, not prove the sun is visible from every point on the street. This distinction should be clear in UI copy where precision details are shown.

## Risks / Trade-offs

- Overpass queries may be slow or rate-limited -> constrain query bounds, debounce map movement, cache recent results, and show loading/error states.
- Segment-level scoring may look fragmented -> use sensible minimum segment lengths and plan a later corridor-merging enhancement.
- Public geocoding APIs may reject browser requests or enforce strict usage policies -> use a browser-suitable provider, cache results, limit request rate, and keep the provider replaceable.
- Geocoding may fail or return ambiguous addresses -> show selectable results or clear error feedback.
- Browser geolocation may be denied or unavailable -> keep address search and manual map panning as alternatives.
- Sunset azimuth calculations can vary by definition of sunset and atmospheric refraction -> use a reputable library/formula consistently and display results as practical guidance rather than survey-grade measurements.
- Highlighting many segments can clutter the map -> hide weak matches by default and tune line opacity/weight by quality.
- Color-only map encodings may be inaccessible -> pair color with opacity, line weight, legend labels, and segment details.

## Migration Plan

No migration is required because this introduces a new capability and the repository has no existing application surface.

## Open Questions

- Which frontend stack should the project adopt?
- Which browser-suitable geocoding provider should be used first for a no-server static deployment?
- Should the first public version call Overpass directly from the browser, or use precomputed/static extracts if public Overpass limits become a problem?
- Should the map analyze only visible bounds, visible bounds capped by area, or a fixed radius around map center?
- What street classes should be included by default: all public streets, pedestrian paths, cycleways, residential roads, or a narrower subset?

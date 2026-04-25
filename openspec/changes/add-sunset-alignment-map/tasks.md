## 1. Project Foundation

- [x] 1.1 Initialize a static Vite React TypeScript single-page app after confirming repository constraints.
- [x] 1.2 Add MapLibre or equivalent map rendering dependencies plus geocoding, OSM data, and solar calculation dependencies or integration modules.
- [x] 1.3 Establish the base application layout with a map area, location controls, date control, and status region.
- [x] 1.4 Select a production-suitable OSM-attributed basemap provider and document required attribution.
- [x] 1.5 Configure the production build for GitHub Pages-compatible static hosting without a paid server or always-running backend.

## 2. Location And Date Inputs

- [x] 2.1 Implement browser geolocation request, success handling, denial handling, and fallback UI.
- [x] 2.2 Implement address search and selection using a browser-suitable geocoding provider behind a replaceable provider interface.
- [x] 2.3 Store the active search center from geolocation, address selection, or map interaction.
- [x] 2.4 Implement date selection with today's date as the default.
- [x] 2.5 Add debouncing, caching, timeout handling, and selectable result handling for geocoding requests.
- [x] 2.6 Interpret selected dates in the active search location's local context for sunset calculations.

## 3. Map And Street Data

- [x] 3.1 Render the interactive map centered on the active search location.
- [x] 3.2 Render a separate GeoJSON overlay source for highlighted candidate segments above the basemap while preserving label readability.
- [x] 3.3 Derive the active analysis area from the current map bounds with a maximum size limit around approximately 5 km from the map center.
- [x] 3.4 Debounce map movement and avoid issuing street data requests when the visible area exceeds the maximum analysis size.
- [x] 3.5 Fetch or reuse OSM street geometry for the active analysis area.
- [x] 3.6 Filter retrieved OSM ways to usable street, path, pedestrian, and cycleway candidates.
- [x] 3.7 Handle loading, empty, and data retrieval error states without disabling map exploration.

## 4. Alignment Computation

- [x] 4.1 Calculate sunset time and sunset azimuth for the active location and selected date.
- [x] 4.2 Split OSM ways into scoreable street segments with approximate length and bearing.
- [x] 4.3 Exclude or merge noisy geometry below the chosen minimum scoreable segment length.
- [x] 4.4 Calculate angular deviation against both segment directions and keep the smaller deviation.
- [x] 4.5 Classify candidates into excellent, good, fair, or hidden based on deviation thresholds.
- [x] 4.6 Preserve street name and geometry metadata needed for display details.

## 5. Visualization And Details

- [x] 5.1 Render highlighted candidate segments on the map with quality-based colors and opacity.
- [x] 5.2 Update highlights when the location, map bounds, or selected date changes.
- [x] 5.3 Show segment details on selection, including name, deviation, sunset time, look direction, and length.
- [x] 5.4 Add UI copy clarifying that highlights represent geometric alignment, not guaranteed physical visibility.
- [x] 5.5 Add non-color quality cues such as line width, opacity, legend text, or detail labels.
- [x] 5.6 Display required OSM-derived map and street data attribution.

## 6. Verification

- [x] 6.1 Add unit coverage for bearing, opposite bearing, angular deviation, length, and classification utilities.
- [x] 6.2 Add fixture-based tests for known locations and dates with expected sunset azimuth ranges.
- [x] 6.3 Add an Overpass-like sample way fixture to validate segment splitting, bearing, minimum length filtering, and classification.
- [x] 6.4 Add tests or manual verification steps for geolocation denial and address selection flows.
- [x] 6.5 Add tests or manual verification steps for map-bound changes triggering refreshed analysis and maximum-area handling.
- [x] 6.6 Run the project's available lint, typecheck, build, and test commands once they are defined.

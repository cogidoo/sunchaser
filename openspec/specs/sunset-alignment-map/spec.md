## Purpose

Help users discover nearby street alignments where the sunset direction matches the street axis for a selected date and location.

## Requirements

### Requirement: Static deployment
The system SHALL be deployable to GitHub Pages as a static single-page web application without a paid server or always-running backend.

#### Scenario: Static app is built
- **WHEN** the application is built for deployment
- **THEN** the build output can be served by static hosting
- **AND** the core map, location, date, sunset calculation, and alignment scoring features do not require a custom backend process

#### Scenario: GitHub Pages hosts the app from a repository path
- **WHEN** the application is served from a GitHub Pages repository path
- **THEN** the application loads its static assets using paths compatible with that hosting mode

### Requirement: Location selection
The system SHALL allow users to choose the map search location using browser geolocation or address entry.

#### Scenario: User allows browser location
- **WHEN** the user requests browser location and grants permission
- **THEN** the system centers the map on the returned location
- **AND** the system uses that location as the alignment search center

#### Scenario: User denies browser location
- **WHEN** the user requests browser location and denies permission
- **THEN** the system keeps the map usable
- **AND** the system presents address entry or manual map navigation as alternatives

#### Scenario: User selects an address result
- **WHEN** the user enters an address and selects a geocoding result
- **THEN** the system centers the map on that result
- **AND** the system uses that result as the alignment search center

#### Scenario: Address search is explicit and cached
- **WHEN** the user enters an address query
- **THEN** the system waits for an explicit search action before sending a geocoding request
- **AND** the system limits repeated requests for the same query by reusing cached results when available

#### Scenario: Address search provider fails
- **WHEN** the browser-suitable geocoding provider rejects or fails a request
- **THEN** the system shows a recoverable error state
- **AND** the system keeps browser location and manual map navigation usable

### Requirement: Date selection
The system SHALL evaluate sunset alignment for a selected calendar date at the active search location, defaulting to the current date.

#### Scenario: Initial date default
- **WHEN** the user opens the application
- **THEN** the selected date is today's date in the user's local context

#### Scenario: User changes date
- **WHEN** the user selects a different date
- **THEN** the system recalculates sunset alignment for the selected date
- **AND** the map updates highlighted street segments accordingly

#### Scenario: Search location differs from browser timezone
- **WHEN** the active search location is in a different timezone from the user's browser
- **THEN** the system interprets the selected calendar date for the active search location
- **AND** the system displays sunset time for the active search location

### Requirement: Sunset calculation
The system SHALL calculate sunset time and sunset azimuth for the active search location and selected date.

#### Scenario: Sunset data is calculated
- **WHEN** the system has an active search location and selected date
- **THEN** the system calculates the local sunset time
- **AND** the system calculates the sunset azimuth in degrees from north

### Requirement: Street data retrieval
The system SHALL retrieve OSM street centerline geometry for the active map analysis area and exclude footway, cycleway, path, and service-road candidates from default alignment results.

#### Scenario: Map area changes
- **WHEN** the user pans or zooms the map enough to change the analysis area
- **THEN** the system retrieves or reuses eligible street centerline geometry for the new area
- **AND** the system avoids unbounded requests by applying a maximum analysis area

#### Scenario: Non-street paths are present in OSM data
- **WHEN** the retrieved OSM data includes footways, cycleways, paths, or service roads
- **THEN** the system excludes those ways from default highlighted alignment results

#### Scenario: Map area exceeds maximum analysis size
- **WHEN** the visible map area exceeds the configured maximum analysis area
- **THEN** the system avoids issuing an oversized street data request
- **AND** the system prompts the user to zoom in or analyzes only the capped area around the map center

#### Scenario: Street data cannot be retrieved
- **WHEN** street geometry retrieval fails
- **THEN** the system shows an error state that preserves map usability
- **AND** the system allows the user to retry by changing the map area or refreshing the query

### Requirement: Segment alignment scoring
The system SHALL score street segments by their smallest angular deviation from the sunset azimuth in either segment direction.

#### Scenario: Segment matches sunset direction
- **WHEN** a street segment bearing or opposite bearing is within the visible threshold of the sunset azimuth
- **THEN** the system classifies the segment as a sunset-aligned candidate

#### Scenario: Segment does not match sunset direction
- **WHEN** both segment directions exceed the visible threshold from the sunset azimuth
- **THEN** the system excludes the segment from default highlighted results

### Requirement: Map highlighting
The system SHALL render sunset-aligned street candidates on the map with color-coded alignment quality.

#### Scenario: Excellent alignment is displayed
- **WHEN** a candidate segment has 0 to 2 degrees of angular deviation
- **THEN** the system renders it with the strongest highlight style

#### Scenario: Good alignment is displayed
- **WHEN** a candidate segment has more than 2 and up to 5 degrees of angular deviation
- **THEN** the system renders it with a secondary highlight style

#### Scenario: Fair alignment is displayed
- **WHEN** a candidate segment has more than 5 and up to 10 degrees of angular deviation
- **THEN** the system renders it with a weaker highlight style

#### Scenario: Short weak candidates are hidden
- **WHEN** a candidate street run has fair alignment but is shorter than the configured fair-candidate minimum length
- **THEN** the system excludes it from default highlighted results

#### Scenario: Short excellent candidates remain eligible
- **WHEN** a candidate street run has excellent alignment and meets the configured excellent-candidate minimum length
- **THEN** the system remains allowed to render it even if it is shorter than the minimum length for weaker candidates

#### Scenario: Highlight quality is not color-only
- **WHEN** the system renders highlighted candidate segments
- **THEN** the system differentiates quality with at least one non-color visual cue such as line width, opacity, legend text, or detail labels

### Requirement: Map source attribution
The system SHALL use map and geodata sources in compliance with their usage and attribution requirements.

#### Scenario: Map is displayed
- **WHEN** the system displays the map
- **THEN** the system displays required attribution for OSM-derived map or street data

#### Scenario: Production basemap is configured
- **WHEN** the system is configured for production usage
- **THEN** the system does not use `tile.openstreetmap.org` as its primary tile source

### Requirement: Segment details
The system SHALL show alignment details when a highlighted street segment is selected.

#### Scenario: User selects a highlighted segment
- **WHEN** the user selects a highlighted street segment
- **THEN** the system displays the street name when available
- **AND** the system displays angular deviation from sunset direction
- **AND** the system displays sunset time for the selected date
- **AND** the system displays the matching look direction
- **AND** the system displays approximate segment length

### Requirement: Geometric alignment disclosure
The system SHALL communicate that highlighted segments represent geometric street alignment, not guaranteed physical visibility of the sun.

#### Scenario: User views highlighted results
- **WHEN** the system displays highlighted street segments
- **THEN** the system provides a visible disclosure that the results are geometric alignments and not guaranteed views of the sun

#### Scenario: User views segment precision details
- **WHEN** the system displays details for a highlighted segment
- **THEN** the system indicates that buildings, trees, terrain, and other obstructions are not included in the alignment score

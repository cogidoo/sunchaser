## MODIFIED Requirements

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
- **WHEN** street geometry retrieval fails or times out
- **THEN** the system shows an error state that preserves map usability
- **AND** the system allows the user to retry by changing the map area or refreshing the query

### Requirement: Map source attribution
The system SHALL use map and geodata sources in compliance with their usage and attribution requirements.

#### Scenario: Map is displayed
- **WHEN** the system displays the map
- **THEN** the system displays required attribution for OSM-derived map or street data

#### Scenario: Production basemap is configured
- **WHEN** the system is configured for production usage
- **THEN** the system does not use `tile.openstreetmap.org` as its primary tile source

#### Scenario: External providers are documented
- **WHEN** the project documents deployment or production use
- **THEN** the system identifies externally hosted provider dependencies and their best-effort availability constraints

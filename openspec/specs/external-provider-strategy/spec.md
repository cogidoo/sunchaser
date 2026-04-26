# external-provider-strategy Specification

## Purpose

Define how Sunchaser uses external map, geocoding, and street-data providers in a static browser-only deployment.

## Requirements
### Requirement: Provider Configuration
The system SHALL centralize externally hosted provider URLs and request limits used for map style, Nominatim-compatible geocoding, and Overpass-compatible street data retrieval.

#### Scenario: Compatible provider endpoint is changed
- **WHEN** a Nominatim-compatible or Overpass-compatible endpoint needs to be replaced
- **THEN** the system can update the configured endpoint without changing unrelated application logic

#### Scenario: Provider protocol changes
- **WHEN** a replacement provider uses different query parameters, response formats, or query language
- **THEN** the system requires provider-specific implementation changes beyond endpoint configuration

### Requirement: Rate-Conscious Provider Usage
The system SHALL avoid high-frequency automatic requests to public geocoding and street-data providers.

#### Scenario: User enters address text
- **WHEN** the user types into the address field
- **THEN** the system does not send geocoding requests until the user explicitly starts a search

#### Scenario: Map moves repeatedly
- **WHEN** the user pans or zooms the map repeatedly
- **THEN** the system debounces street-data retrieval
- **AND** the system avoids issuing requests for analysis areas larger than the configured maximum

### Requirement: Provider Failure Handling
The system SHALL keep the app usable when an external provider request fails or times out.

#### Scenario: Geocoding provider fails
- **WHEN** the geocoding provider fails or times out
- **THEN** the system shows a recoverable error state
- **AND** the map remains usable through browser location and manual navigation

#### Scenario: Street-data provider fails
- **WHEN** the street-data provider fails or times out
- **THEN** the system shows a recoverable error state
- **AND** the map remains usable with its current basemap and controls

### Requirement: Provider Transparency
The system SHALL document current external providers and the best-effort nature of public-provider availability.

#### Scenario: User reads project documentation
- **WHEN** the user reads the project README
- **THEN** the documentation identifies the external provider categories used by the app
- **AND** the documentation describes public-provider availability as best-effort

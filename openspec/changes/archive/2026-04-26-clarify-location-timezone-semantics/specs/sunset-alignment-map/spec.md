## MODIFIED Requirements

### Requirement: Date selection
The system SHALL evaluate sunset alignment for a selected calendar date at the active search location, defaulting to the current date.

#### Scenario: Initial date default
- **WHEN** the user opens the application
- **THEN** the selected date is today's date in the user's local context

#### Scenario: User changes date
- **WHEN** the user selects a different date
- **THEN** the system recalculates sunset alignment for the selected date in the active location's timezone
- **AND** the map updates highlighted street segments accordingly

#### Scenario: Search location differs from browser timezone
- **WHEN** the active search location is in a different timezone from the user's browser
- **THEN** the system interprets the selected calendar date for the active search location
- **AND** the system displays sunset time for the active search location with timezone context

### Requirement: Sunset calculation
The system SHALL calculate sunset time and sunset azimuth for the active search location and selected location-local date.

#### Scenario: Sunset data is calculated
- **WHEN** the system has an active search location and selected date
- **THEN** the system calculates the local sunset time for the active search location
- **AND** the system calculates the sunset azimuth in degrees from north for the active search location

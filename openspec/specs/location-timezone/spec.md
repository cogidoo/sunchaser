# location-timezone Specification

## Purpose

Define how Sunchaser determines and applies the active map location's timezone for date interpretation and sunset display.

## Requirements
### Requirement: Active Location Timezone
The system SHALL determine the timezone for the active map location used for sunset alignment.

#### Scenario: Browser location has timezone
- **WHEN** the active location is set from browser geolocation
- **THEN** the system determines a timezone for that latitude and longitude

#### Scenario: Address result has timezone
- **WHEN** the user selects an address result
- **THEN** the system determines a timezone for that result's latitude and longitude

#### Scenario: Manual map navigation changes active location
- **WHEN** manual map navigation changes the active analysis center
- **THEN** the system updates the active location timezone when the new center resolves to a different timezone

#### Scenario: Timezone cannot be determined
- **WHEN** the system cannot determine a timezone for the active location
- **THEN** the system uses a visible fallback state
- **AND** the system does not present browser-local sunset time as confirmed location-local time

### Requirement: Location-Local Calendar Date
The system SHALL interpret the selected calendar date in the active location's timezone for sunset calculations.

#### Scenario: Location timezone differs from browser timezone
- **WHEN** the selected calendar date is evaluated for a location in a different timezone from the browser
- **THEN** the system calculates sunset for that calendar date in the active location's timezone

#### Scenario: Sunset time is displayed
- **WHEN** the system displays sunset time
- **THEN** the system includes timezone context for the active location or a visible fallback indicator

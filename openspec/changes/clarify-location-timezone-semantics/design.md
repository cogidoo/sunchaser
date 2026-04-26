## Context

Sunchaser is a static browser app. It currently derives the selected date from an HTML date input and calculates sunset data with browser-local JavaScript date behavior. That is acceptable only when the browser timezone and active map location timezone match. Address search and manual map navigation allow users to analyze places elsewhere, so the date and displayed sunset time must follow the active location.

## Goals / Non-Goals

**Goals:**

- Determine the IANA timezone for the active map location in the browser.
- Interpret the selected calendar date as a date in that timezone.
- Display sunset time with timezone context.
- Keep the app static and GitHub Pages compatible.
- Add regression tests for browser timezone differing from active location timezone.

**Non-Goals:**

- Adding a backend timezone service.
- Persisting user timezone preferences.
- Guaranteeing historical timezone-law accuracy beyond what the selected browser-side strategy provides.

## Decisions

- Use a browser-side timezone lookup strategy. This preserves static deployment and avoids introducing an always-running backend.
- Store active timezone separately from browser timezone. This makes UI copy and tests explicit and avoids hidden coupling to the user's environment.
- Treat timezone lookup failure as recoverable. If lookup fails, the app SHALL make the fallback visible instead of silently presenting browser-local results as location-local truth.
- Keep sunset azimuth tied to the active location and selected location-local date. The highlighted geometry depends on azimuth, so date interpretation is not just a display concern.

## Risks / Trade-offs

- Static timezone lookup libraries can add bundle weight. Mitigation: compare package size before implementation and prefer a compact lookup approach.
- Timezone boundaries can be politically complex. Mitigation: document that the app uses best-effort timezone data from the chosen browser-side source.
- Fallback behavior can still be less accurate. Mitigation: surface fallback status in the UI and tests.

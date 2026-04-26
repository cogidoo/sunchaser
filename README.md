# Sunchaser

Sunchaser is a static web app that highlights street alignments where the sunset lines up with the street axis.

Live app: https://cogidoo.github.io/sunchaser/

## What It Does

- Uses browser location or address search to set the map center.
- Calculates sunset time and azimuth for the selected date.
- Fetches nearby OpenStreetMap street geometry through Overpass.
- Highlights street runs whose bearing aligns with sunset.
- Shows alignment quality, deviation, look direction, and approximate length.

Highlighted streets are geometric candidates only. Buildings, trees, terrain, and other obstructions are not included in the visibility score.

## External Providers

- Basemap/style: OpenFreeMap-hosted MapLibre style with OSM-derived map data.
- Geocoding: Nominatim/OpenStreetMap search, requested only after explicit address search.
- Street geometry: Overpass API for bounded OSM street-centerline queries.

This static app calls public browser-accessible providers directly and does not run a backend proxy or shared cache. Availability is best-effort: providers can rate-limit, reject, time out, or change service behavior. The app keeps map interaction usable when a provider request fails, but it does not provide production uptime guarantees for third-party services.

## Development

```bash
cd app
npm install
npm run dev
```

## Verification

```bash
cd app
npm run test
npm run lint
npm run build
```

## Deployment

The app is built as a static Vite single-page app and deployed to GitHub Pages via GitHub Actions.

GitHub Pages source should be set to `GitHub Actions` in the repository settings.

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

export const appConfig = {
  defaultCenter: { lat: 52.52, lon: 13.405 },
  // Public providers are best-effort for this static MVP; keep usage bounded and explicit.
  mapStyleUrl: 'https://tiles.openfreemap.org/styles/positron',
  nominatimSearchUrl: 'https://nominatim.openstreetmap.org/search',
  overpassUrl: 'https://overpass-api.de/api/interpreter',
  maxAnalysisDiagonalKm: 12,
  geocodingTimeoutMs: 8000,
  overpassTimeoutMs: 15_000,
}

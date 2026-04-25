import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl, { type GeoJSONSource, type Map, type MapLayerMouseEvent } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import './App.css'
import { buildAlignedSegments, toSegmentFeatureCollection, type StreetSegment } from './lib/geometry'
import { searchAddress, type GeocodeResult } from './lib/geocoding'
import { boundsDiagonalKilometers, fetchStreetWays, type Bounds } from './lib/overpass'
import { formatDegrees, getSunsetInfo } from './lib/sun'

const DEFAULT_CENTER = { lat: 52.52, lon: 13.405 }
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron'
const SEGMENT_SOURCE_ID = 'sunset-segments'
const SEGMENT_LAYER_ID = 'sunset-segments-line'
const MAX_ANALYSIS_DIAGONAL_KM = 12

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function App() {
  const mapNode = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<Map | null>(null)
  const [center, setCenter] = useState(DEFAULT_CENTER)
  const [activeBounds, setActiveBounds] = useState<Bounds | null>(null)
  const [date, setDate] = useState(todayInputValue)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeocodeResult[]>([])
  const [segments, setSegments] = useState<StreetSegment[]>([])
  const [status, setStatus] = useState('Karte bereit. Nutze Standort oder suche eine Adresse.')

  const sunset = useMemo(() => {
    try {
      return getSunsetInfo(date, center.lat, center.lon)
    } catch {
      return null
    }
  }, [center.lat, center.lon, date])

  useEffect(() => {
    if (!mapNode.current || mapRef.current) {
      return
    }

    mapRef.current = new maplibregl.Map({
      container: mapNode.current,
      style: MAP_STYLE,
      center: [DEFAULT_CENTER.lon, DEFAULT_CENTER.lat],
      zoom: 12,
      attributionControl: false,
    })

    mapRef.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')
    mapRef.current.addControl(
      new maplibregl.AttributionControl({ compact: true, customAttribution: 'Map data © OpenStreetMap contributors' }),
      'bottom-right',
    )

    mapRef.current.on('load', () => {
      const map = mapRef.current

      if (!map) {
        return
      }

      const firstSymbolLayer = map.getStyle().layers.find((layer) => layer.type === 'symbol')?.id

      map.addSource(SEGMENT_SOURCE_ID, {
        type: 'geojson',
        data: toSegmentFeatureCollection([]),
      })

      map.addLayer(
        {
          id: SEGMENT_LAYER_ID,
          type: 'line',
          source: SEGMENT_SOURCE_ID,
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': [
              'match',
              ['get', 'alignmentClass'],
              'excellent',
              '#ff3d00',
              'good',
              '#ff9d3d',
              'fair',
              '#ffd166',
              '#ffd166',
            ],
            'line-opacity': [
              'match',
              ['get', 'alignmentClass'],
              'excellent',
              0.95,
              'good',
              0.82,
              'fair',
              0.62,
              0.62,
            ],
            'line-width': [
              'match',
              ['get', 'alignmentClass'],
              'excellent',
              8,
              'good',
              6,
              'fair',
              4,
              4,
            ],
          },
        },
        firstSymbolLayer,
      )

      map.on('click', SEGMENT_LAYER_ID, showSegmentPopup)
      map.on('mouseenter', SEGMENT_LAYER_ID, () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', SEGMENT_LAYER_ID, () => {
        map.getCanvas().style.cursor = ''
      })

      setActiveBounds(readMapBounds(map))
    })

    mapRef.current.on('moveend', () => {
      const map = mapRef.current
      const nextCenter = map?.getCenter()

      if (nextCenter) {
        setCenter({ lat: nextCenter.lat, lon: nextCenter.lng })
      }

      if (map) {
        setActiveBounds(readMapBounds(map))
      }
    })

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    mapRef.current?.easeTo({ center: [center.lon, center.lat], duration: 500 })
  }, [center.lat, center.lon])

  useEffect(() => {
    const map = mapRef.current
    const source = map?.getSource(SEGMENT_SOURCE_ID) as GeoJSONSource | undefined

    source?.setData(toSegmentFeatureCollection(segments))
  }, [segments])

  useEffect(() => {
    if (!activeBounds || !sunset) {
      return
    }

    const timeout = window.setTimeout(() => {
      const diagonal = boundsDiagonalKilometers(activeBounds)

      if (diagonal > MAX_ANALYSIS_DIAGONAL_KM) {
        setSegments([])
        setStatus('Zoom weiter hinein, um Strassen zu analysieren. Der sichtbare Bereich ist noch zu gross.')
        return
      }

      setStatus('Strassen werden geladen und gegen den Sonnenuntergang abgeglichen...')

      fetchStreetWays(activeBounds)
        .then((ways) => {
          const nextSegments = buildAlignedSegments(ways, sunset.azimuth)
          setSegments(nextSegments)
          setStatus(
            nextSegments.length
              ? `${nextSegments.length} passende Strassenabschnitte gefunden.`
              : 'Keine passenden Strassenabschnitte im aktuellen Kartenausschnitt gefunden.',
          )
        })
        .catch(() => {
          setSegments([])
          setStatus('Strassendaten konnten nicht geladen werden. Bitte zoome naeher heran oder versuche es spaeter erneut.')
        })
    }, 900)

    return () => window.clearTimeout(timeout)
  }, [activeBounds, sunset])

  useEffect(() => {
    const trimmed = query.trim()

    if (trimmed.length < 3) {
      return
    }

    const timeout = window.setTimeout(() => {
      searchAddress(trimmed)
        .then((nextResults) => {
          setResults(nextResults)
          setStatus(nextResults.length ? 'Adresse gefunden. Waehle einen Treffer aus.' : 'Keine Adresse gefunden.')
        })
        .catch(() => {
          setResults([])
          setStatus('Adresssuche ist gerade nicht erreichbar. Karte und Standort funktionieren weiter.')
        })
    }, 700)

    return () => window.clearTimeout(timeout)
  }, [query])

  function useBrowserLocation() {
    if (!navigator.geolocation) {
      setStatus('Dieser Browser unterstuetzt keine Standortabfrage.')
      return
    }

    setStatus('Standort wird abgefragt...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({ lat: position.coords.latitude, lon: position.coords.longitude })
        setStatus('Standort gesetzt. Sonnenuntergangsdaten wurden aktualisiert.')
      },
      () => setStatus('Standort wurde nicht freigegeben. Du kannst eine Adresse suchen oder die Karte verschieben.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function selectResult(result: GeocodeResult) {
    setCenter({ lat: result.lat, lon: result.lon })
    setQuery(result.label)
    setResults([])
    setStatus('Adresse gesetzt. Die Karte ist bereit fuer die Strassenanalyse.')
  }

  function updateQuery(value: string) {
    setQuery(value)

    if (value.trim().length < 3) {
      setResults([])
    }
  }

  return (
    <main className="app-shell">
      <section className="control-panel" aria-label="Sonnenflucht Einstellungen">
        <div>
          <p className="eyebrow">Sunchaser</p>
          <h1>Sonnenflucht-Karte</h1>
          <p className="intro">
            Finde Strassenachsen, in denen die Sonne beim Untergang geometrisch in der Flucht liegt.
          </p>
        </div>

        <div className="controls">
          <button type="button" onClick={useBrowserLocation}>
            Standort verwenden
          </button>

          <label>
            Adresse
            <input
              type="search"
              value={query}
              placeholder="Adresse oder Ort suchen"
              onChange={(event) => updateQuery(event.target.value)}
            />
          </label>

          {results.length > 0 && (
            <ul className="search-results" aria-label="Adressvorschlaege">
              {results.map((result) => (
                <li key={result.id}>
                  <button type="button" onClick={() => selectResult(result)}>
                    {result.label}
                  </button>
                </li>
              ))}
            </ul>
          )}

          <label>
            Datum
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
        </div>

        <div className="sun-card" aria-live="polite">
          <span>Sonnenuntergang</span>
          {sunset ? (
            <>
              <strong>{sunset.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
              <p>
                Richtung {formatDegrees(sunset.azimuth)} ({sunset.cardinal})
              </p>
            </>
          ) : (
            <p>Fuer diesen Ort und Tag wurde kein Sonnenuntergang gefunden.</p>
          )}
        </div>

        <div className="legend" aria-label="Legende fuer Strassenfluchten">
          <span>
            <i className="excellent" /> 0-2° perfekt
          </span>
          <span>
            <i className="good" /> 2-5° gut
          </span>
          <span>
            <i className="fair" /> 5-10° brauchbar
          </span>
        </div>

        {segments.length > 0 && (
          <ol className="segment-list" aria-label="Beste Strassenabschnitte">
            {segments.slice(0, 5).map((segment) => (
              <li key={segment.id}>
                <strong>{segment.name}</strong>
                <span>
                  {formatDegrees(segment.deviation)} Abweichung, {Math.round(segment.lengthMeters)} m
                </span>
              </li>
            ))}
          </ol>
        )}

        <p className="status" role="status">
          {status}
        </p>

        <p className="disclaimer">
          Die Farben zeigen geometrische Strassenfluchten, keine garantierte Sichtbarkeit durch Gebaeude, Baeume oder
          Gelaende. OSM- und Overpass-Daten koennen unvollstaendig sein.
        </p>
      </section>

      <section className="map-panel" aria-label="Karte">
        <div ref={mapNode} className="map" />
      </section>
    </main>
  )
}

function readMapBounds(map: Map): Bounds {
  const bounds = map.getBounds()

  return {
    south: bounds.getSouth(),
    west: bounds.getWest(),
    north: bounds.getNorth(),
    east: bounds.getEast(),
  }
}

function showSegmentPopup(event: MapLayerMouseEvent) {
  const feature = event.features?.[0]
  const coordinates = event.lngLat

  if (!feature?.properties) {
    return
  }

  const name = String(feature.properties.name ?? 'Unbenannte Strasse')
  const deviation = Number(feature.properties.deviation ?? 0)
  const matchedBearing = Number(feature.properties.matchedBearing ?? 0)
  const lengthMeters = Number(feature.properties.lengthMeters ?? 0)
  const alignmentClass = String(feature.properties.alignmentClass ?? '')

  new maplibregl.Popup({ offset: 16 })
    .setLngLat(coordinates)
    .setHTML(
      `<strong>${escapeHtml(name)}</strong><br />` +
        `Qualitaet: ${escapeHtml(alignmentClass)}<br />` +
        `Abweichung: ${formatDegrees(deviation)}<br />` +
        `Blickrichtung: ${formatDegrees(matchedBearing)}<br />` +
        `Laenge: ${Math.round(lengthMeters)} m`,
    )
    .addTo(event.target)
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }

    return entities[character]
  })
}

export default App

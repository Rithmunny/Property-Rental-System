import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import { PHNOM_PENH_CENTER } from '@/utils/listing'

function priceIcon(price, highlighted) {
  return L.divIcon({
    className: 'rent-map-pin',
    html: `<div class="rent-map-pin-inner ${highlighted ? 'is-active' : ''}">$${price}</div>`,
    iconSize: [64, 32],
    iconAnchor: [32, 16],
    popupAnchor: [0, -14],
  })
}

function FitBounds({ properties }) {
  const map = useMap()

  useEffect(() => {
    const timer = setTimeout(() => map.invalidateSize(), 150)
    if (!properties.length) {
      map.setView([12.4, 104.9], 7)
      return () => clearTimeout(timer)
    }
    if (properties.length === 1) {
      map.setView([properties[0].lat, properties[0].lng], 14)
      return () => clearTimeout(timer)
    }
    const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 })
    return () => clearTimeout(timer)
  }, [map, properties])

  return null
}

export default function RentMap({ properties, activeId, onSelect }) {
  const items = useMemo(
    () => properties.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)),
    [properties],
  )

  return (
    <div className="rent-map relative z-0 h-full min-h-[360px] overflow-hidden rounded-2xl border border-gray-200">
      <MapContainer
        center={[PHNOM_PENH_CENTER.lat, PHNOM_PENH_CENTER.lng]}
        zoom={12}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds properties={items} />
        {items.map((p) => (
          <Marker
            key={`${p.id}-${activeId === p.id ? 'on' : 'off'}`}
            position={[p.lat, p.lng]}
            icon={priceIcon(p.price, activeId === p.id)}
            eventHandlers={{
              click: () => onSelect?.(p.id),
            }}
          >
            <Popup>
              <div className="min-w-[140px]">
                <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {p.neighbourhood || p.city} · ${p.price}/mo
                </p>
                <Link
                  to={`/listings/${p.id}`}
                  className="mt-2 inline-block text-xs font-semibold text-forest hover:underline"
                >
                  View listing
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

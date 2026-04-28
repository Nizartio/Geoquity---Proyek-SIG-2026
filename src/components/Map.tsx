import { useEffect, useRef, useState } from 'react';
import L, { GeoJSON as LeafletGeoJSON } from 'leaflet';
import type { FeatureCollection, Geometry } from 'geojson';
import 'leaflet/dist/leaflet.css';
import type { ProvinceData } from '../utils/inequality';
import { getColor, getScale } from '../utils/colorScale';
import { loadIndonesiaProvinceGeoJson, normalizeProvinceName } from '../data/indonesia-province-normalized';

interface MapProps {
  /** All province data records (with inequality index computed) */
  data: ProvinceData[];
  /** Currently selected province names */
  selected: string[];
  /** Called when the user clicks a province polygon */
  onSelect: (province: string, additive: boolean) => void;
}

/**
 * Interactive Leaflet choropleth map of Indonesia.
 *
 * - Colours each province by its inequality index
 * - Shows a tooltip on hover (province name + key indicators)
 * - Fires onSelect when a province is clicked
 */
export default function Map({ data, selected, onSelect }: MapProps) {
  const INDONESIA_CENTER: L.LatLngExpression = [-2.5, 118];
  const INDONESIA_ZOOM = 5;
  const mapRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<LeafletGeoJSON | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [geoJsonData, setGeoJsonData] = useState<
    FeatureCollection<Geometry, { name?: string }> | null
  >(null);

  /** Build a lookup map for O(1) access by province name */
  const dataMap = Object.fromEntries(data.map((d) => [normalizeProvinceName(d.province), d]));
  const colorScale = getScale();

  // ── Initialise map once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: INDONESIA_CENTER,
      zoom: INDONESIA_ZOOM,
      zoomControl: true,
    });

    // OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadIndonesiaProvinceGeoJson()
      .then((geojson) => {
        if (!cancelled) {
          setGeoJsonData(geojson as FeatureCollection<Geometry, { name?: string }>);
        }
      })
      .catch((error) => {
        console.error('Failed to load map geojson', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Re-render GeoJSON layer whenever data or selection changes ────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !geoJsonData) return;

    // Remove previous layer
    if (geoLayerRef.current) {
      geoLayerRef.current.remove();
    }

    const layer = L.geoJSON(geoJsonData, {
      style: (feature) => {
        const name = (feature?.properties as { name?: string } | undefined)?.name;
        const record = name ? dataMap[name] : undefined;
        const isSelected = !!name && selected.includes(name);

        return {
          fillColor: record ? getColor(record.poverty) : '#cccccc',
          fillOpacity: 0.75,
          color: isSelected ? '#1d4ed8' : '#555',
          weight: isSelected ? 3 : 1,
          opacity: 1,
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const rawName = (feature.properties as { name?: string } | undefined)?.name;
        const name = normalizeProvinceName(rawName);
        if (!name) return;

        const record = dataMap[name];

        // Tooltip content
        const tooltipContent = record
          ? `<div class="text-sm">
               <p class="font-bold text-gray-800">${name}</p>
               <p>Kemiskinan: <strong>${record.poverty}%</strong></p>
               <p>Pendapatan: <strong>Rp ${record.income.toLocaleString('id-ID')} rb</strong></p>
               <p>Indeks Ketimpangan: <strong>${record.inequality?.toFixed(1)}</strong></p>
             </div>`
          : `<strong>${name}</strong><br/>Data tidak tersedia`;

        featureLayer.bindTooltip(tooltipContent, {
          sticky: true,
          opacity: 0.95,
          className: 'rounded-lg shadow-md border-0 px-2 py-1',
        });

        // Highlight on hover
        featureLayer.on('mouseover', () => {
          (featureLayer as L.Path).setStyle({ fillOpacity: 0.95 });
        });
        featureLayer.on('mouseout', () => {
          layer.resetStyle(featureLayer as L.Path);
        });

        // Click → select province
        featureLayer.on('click', (event: L.LeafletMouseEvent) => {
          const originalEvent = event.originalEvent as MouseEvent;
          const additive = originalEvent.ctrlKey || originalEvent.metaKey;
          onSelect(name, additive);
        });
      },
    });

    layer.addTo(map);
    geoLayerRef.current = layer;
  }, [data, selected, dataMap, onSelect, geoJsonData]);

  const recenterToIndonesia = () => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo(INDONESIA_CENTER, INDONESIA_ZOOM, { duration: 0.8 });
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md">
      <div ref={containerRef} className="w-full h-full" />

      <button
        type="button"
        onClick={recenterToIndonesia}
        className="absolute top-3 right-3 z-[1100] bg-white/90 text-[#0f5f79] text-[11px] sm:text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow hover:bg-slate-50 active:scale-[0.98] transition"
      >
        Kembali ke Indonesia
      </button>

      {/* Colour legend */}
      <div className="absolute bottom-3 right-3 bg-white/88 rounded-xl shadow p-2 text-[11px] z-[1000]">
        <p className="font-semibold text-gray-700 mb-1">Kemiskinan (%)</p>
        {[...colorScale].reverse().map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1 mt-0.5">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ background: color }} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

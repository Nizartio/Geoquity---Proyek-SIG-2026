import { useEffect, useRef } from 'react';
import L, { GeoJSON as LeafletGeoJSON } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Feature, GeoJsonObject } from 'geojson';
import type { ProvinceData } from '../utils/inequality';
import { getColor } from '../utils/colorScale';
import geoData from '../data/indonesia.geojson';

interface MapProps {
  /** All province data records (with inequality index computed) */
  data: ProvinceData[];
  /** Currently selected province name (empty string = none) */
  selected: string;
  /** Called when the user clicks a province polygon */
  onSelect: (province: string) => void;
}

/**
 * Interactive Leaflet choropleth map of Indonesia.
 *
 * - Colours each province by its inequality index
 * - Shows a tooltip on hover (province name + key indicators)
 * - Fires onSelect when a province is clicked
 */
export default function Map({ data, selected, onSelect }: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<LeafletGeoJSON | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /** Build a lookup map for O(1) access by province name */
  const dataMap = Object.fromEntries(data.map((d) => [d.province, d]));

  // ── Initialise map once ──────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [-2.5, 118],
      zoom: 5,
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

  // ── Re-render GeoJSON layer whenever data or selection changes ────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous layer
    if (geoLayerRef.current) {
      geoLayerRef.current.remove();
    }

    const layer = L.geoJSON(geoData as GeoJsonObject, {
      style: (feature) => {
        const name = (feature as Feature)?.properties?.name as string | undefined;
        const record = name ? dataMap[name] : undefined;
        const isSelected = name === selected;

        return {
          fillColor: record ? getColor(record.inequality ?? 0) : '#cccccc',
          fillOpacity: 0.75,
          color: isSelected ? '#1d4ed8' : '#555',
          weight: isSelected ? 3 : 1,
          opacity: 1,
        };
      },
      onEachFeature: (feature, featureLayer) => {
        const name = (feature as Feature)?.properties?.name as string | undefined;
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
        featureLayer.on('click', () => {
          onSelect(name === selected ? '' : name);
        });
      },
    });

    layer.addTo(map);
    geoLayerRef.current = layer;
  }, [data, selected, dataMap, onSelect]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md">
      <div ref={containerRef} className="w-full h-full" />

      {/* Colour legend */}
      <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 rounded-xl shadow p-3 text-xs z-[1000]">
        <p className="font-semibold text-gray-700 mb-1">Indeks Ketimpangan</p>
        {[
          { color: '#ffffcc', label: '< 10' },
          { color: '#fed976', label: '10 – 20' },
          { color: '#fd8d3c', label: '20 – 30' },
          { color: '#f03b20', label: '30 – 40' },
          { color: '#bd0026', label: '≥ 40' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 mt-0.5">
            <span className="w-4 h-4 rounded-sm inline-block" style={{ background: color }} />
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import type { FeatureCollection, Geometry } from 'geojson';
import rawGeoJsonUrl from './indonesia-provinces.json?url';

type RawProvinceProperties = {
  ID?: number;
  kode?: number;
  Propinsi?: string;
  KODE_PROV?: string;
  PROVINSI?: string;
  SUMBER?: string;
};

type NormalizedProvinceProperties = RawProvinceProperties & {
  name: string;
};

type NormalizedProvinceGeoJson = FeatureCollection<Geometry, NormalizedProvinceProperties>;

// Keys are normalized form (uppercase, dots removed, single spaces), e.g. 'KEPULAUAN RIAU'
const provinceNameMap: Record<string, string> = {
  'ACEH': 'Aceh',
  'SUMATERA UTARA': 'Sumatera Utara',
  'SUMATERA BARAT': 'Sumatera Barat',
  'RIAU': 'Riau',
  'KEPULAUAN RIAU': 'Kepulauan Riau',
  'JAMBI': 'Jambi',
  'BENGKULU': 'Bengkulu',
  'SUMATERA SELATAN': 'Sumatera Selatan',
  'KEPULAUAN BANGKA BELITUNG': 'Kepulauan Bangka Belitung',
  'LAMPUNG': 'Lampung',
  'BANTEN': 'Banten',
  'DKI JAKARTA': 'DKI Jakarta',
  'JAWA BARAT': 'Jawa Barat',
  'JAWA TENGAH': 'Jawa Tengah',
  'DI YOGYAKARTA': 'DI Yogyakarta',
  'JAWA TIMUR': 'Jawa Timur',
  'BALI': 'Bali',
  'NUSA TENGGARA BARAT': 'Nusa Tenggara Barat',
  'NUSA TENGGARA TIMUR': 'Nusa Tenggara Timur',
  'KALIMANTAN BARAT': 'Kalimantan Barat',
  'KALIMANTAN TENGAH': 'Kalimantan Tengah',
  'KALIMANTAN SELATAN': 'Kalimantan Selatan',
  'KALIMANTAN TIMUR': 'Kalimantan Timur',
  'KALIMANTAN UTARA': 'Kalimantan Utara',
  'SULAWESI UTARA': 'Sulawesi Utara',
  'SULAWESI TENGAH': 'Sulawesi Tengah',
  'SULAWESI SELATAN': 'Sulawesi Selatan',
  'SULAWESI TENGGARA': 'Sulawesi Tenggara',
  'SULAWESI BARAT': 'Sulawesi Barat',
  'GORONTALO': 'Gorontalo',
  'MALUKU': 'Maluku',
  'MALUKU UTARA': 'Maluku Utara',
  'PAPUA': 'Papua',
  'PAPUA BARAT': 'Papua Barat',
  'PAPUA TENGAH': 'Papua Tengah',
  'PAPUA PEGUNUNGAN': 'Papua Pegunungan',
  'PAPUA SELATAN': 'Papua Selatan',
  'PAPUA BARAT DAYA': 'Papua Barat Daya',
};

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function normalizeProvinceName(rawName?: string): string {
  if (!rawName) return '';

  // Normalize: uppercase, remove dots, expand common abbreviations (KEP → KEPULAUAN),
  // collapse whitespace. This produces keys matching `provinceNameMap` above.
  let normalizedKey = rawName.trim().toUpperCase();
  normalizedKey = normalizedKey.replace(/\./g, '');
  // Expand standalone 'KEP' abbreviation to 'KEPULAUAN'
  normalizedKey = normalizedKey.replace(/\bKEP\b/g, 'KEPULAUAN');
  // Normalize common long forms to canonical short forms
  // e.g. 'DAERAH ISTIMEWA YOGYAKARTA' -> 'DI YOGYAKARTA'
  normalizedKey = normalizedKey.replace(/\bDAERAH ISTIMEWA\b/g, 'DI');
  // e.g. 'DAERAH KHUSUS IBUKOTA JAKARTA' -> 'DKI JAKARTA'
  normalizedKey = normalizedKey.replace(/\bDAERAH KHUSUS IBUKOTA\b/g, 'DKI');
  normalizedKey = normalizedKey.replace(/\s+/g, ' ').trim();

  return provinceNameMap[normalizedKey] ?? toTitleCase(normalizedKey);
}

let cachedGeoJson: NormalizedProvinceGeoJson | null = null;

function normalizeGeoJson(
  featureCollection: FeatureCollection<Geometry, RawProvinceProperties>
): NormalizedProvinceGeoJson {
  return {
    type: 'FeatureCollection',
    features: featureCollection.features.map((feature) => ({
      ...feature,
      properties: {
        ...feature.properties,
        name: normalizeProvinceName(feature.properties?.PROVINSI ?? feature.properties?.Propinsi),
      },
    })),
  };
}

export async function loadIndonesiaProvinceGeoJson(): Promise<NormalizedProvinceGeoJson> {
  if (cachedGeoJson) return cachedGeoJson;

  const response = await fetch(rawGeoJsonUrl);
  if (!response.ok) {
    throw new Error(`Failed to load province GeoJSON: ${response.status}`);
  }

  const rawGeoJson = (await response.json()) as FeatureCollection<Geometry, RawProvinceProperties>;
  cachedGeoJson = normalizeGeoJson(rawGeoJson);
  return cachedGeoJson;
}
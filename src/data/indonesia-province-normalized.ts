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

const provinceNameMap: Record<string, string> = {
  'BALI': 'Bali',
  'BANGKA BELITUNG': 'Kepulauan Bangka Belitung',
  'BENGKULU': 'Bengkulu',
  'DAERAH KHUSUS IBUKOTA JAKARTA': 'DKI Jakarta',
  'DAERAH ISTIMEWA YOGYAKARTA': 'DI Yogyakarta',
  'DI YOGYAKARTA': 'DI Yogyakarta',
  'DI. ACEH': 'Aceh',
  'DI ACEH': 'Aceh',
  'DKI JAKARTA': 'DKI Jakarta',
  'GORONTALO': 'Gorontalo',
  'IRIAN JAYA': 'Papua',
  'IRIAN JAYA BARAT': 'Papua Barat',
  'PAPUA BARAT': 'Papua Barat',
  'IRIAN JAYA TENGAH': 'Papua Tengah',
  'IRIAN JAYA TIMUR': 'Papua',
  'JAMBI': 'Jambi',
  'JAWA BARAT': 'Jawa Barat',
  'JAWA TENGAH': 'Jawa Tengah',
  'JAWA TIMUR': 'Jawa Timur',
  'KALIMANTAN BARAT': 'Kalimantan Barat',
  'KALIMANTAN SELATAN': 'Kalimantan Selatan',
  'KALIMANTAN TENGAH': 'Kalimantan Tengah',
  'KALIMANTAN TIMUR': 'Kalimantan Timur',
  'KALIMANTAN UTARA': 'Kalimantan Utara',
  'KEPULAUAN RIAU': 'Kepulauan Riau',
  'LAMPUNG': 'Lampung',
  'MALUKU': 'Maluku',
  'MALUKU UTARA': 'Maluku Utara',
  'NUSA TENGGARA BARAT': 'Nusa Tenggara Barat',
  'NUSA TENGGARA TIMUR': 'Nusa Tenggara Timur',
  'NUSATENGGARA BARAT': 'Nusa Tenggara Barat',
  'PAPUA BARAT DAYA': 'Papua Barat',
  'PAPUA PEGUNUNGAN': 'Papua',
  'PAPUA SELATAN': 'Papua',
  'PAPUA TENGAH': 'Papua',
  'PROBANTEN': 'Banten',
  'RIAU': 'Riau',
  'SULAWESI SELATAN': 'Sulawesi Selatan',
  'SULAWESI BARAT': 'Sulawesi Barat',
  'SULAWESI TENGAH': 'Sulawesi Tengah',
  'SULAWESI TENGGARA': 'Sulawesi Tenggara',
  'SULAWESI UTARA': 'Sulawesi Utara',
  'SUMATERA BARAT': 'Sumatera Barat',
  'SUMATERA SELATAN': 'Sumatera Selatan',
  'SUMATERA UTARA': 'Sumatera Utara',
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

  const normalizedKey = rawName.trim().toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ');
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
/// <reference types="vite/client" />

// Allow importing GeoJSON files as modules
declare module '*.geojson' {
  import type { GeoJsonObject } from 'geojson';
  const value: GeoJsonObject;
  export default value;
}

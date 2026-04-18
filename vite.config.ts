import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite plugin that treats .geojson files as JSON modules.
 * This allows `import geoData from './file.geojson'` to work.
 */
function geojsonPlugin(): Plugin {
  return {
    name: 'vite-plugin-geojson',
    transform(src, id) {
      if (id.endsWith('.geojson')) {
        return { code: `export default ${src}`, map: null };
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), geojsonPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('leaflet') || id.includes('react-leaflet')) {
            return 'map-vendor';
          }

          if (id.includes('recharts')) {
            return 'chart-vendor';
          }

          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-vendor';
          }
        },
      },
    },
  },
});


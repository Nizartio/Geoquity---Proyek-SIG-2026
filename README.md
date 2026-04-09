# Geoquity – Web GIS Dashboard Ketimpangan Ekonomi Indonesia

Proyek Kelompok 6 dari Mata Kuliah Sistem Informasi Geografis dengan output berupa Dashboard Tingkat Ketimpangan Ekonomi per Provinsi Di Indonesia beserta Analisis dan Statistik datanya.

## 📸 Fitur

- 🗺️ **Peta Choropleth Interaktif** – peta Indonesia (level provinsi) diwarnai berdasarkan indeks ketimpangan
- 📊 **Dashboard Statistik** – kartu ringkasan + bar chart + pie chart menggunakan Recharts
- 🔎 **Filter Provinsi** – pilih provinsi dari dropdown atau klik di peta
- 💬 **Tooltip** – hover di atas provinsi untuk melihat data detail
- ⚡ **Loading & Error state** – animasi spinner & pesan error yang ramah pengguna
- 📱 **Responsive** – tampilan berfungsi di desktop maupun mobile

## 🛠️ Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Peta | Leaflet + react-leaflet |
| Grafik | Recharts |
| Linting | ESLint + Prettier |

## 📁 Struktur Folder

```
src/
  components/
    Map.tsx          # Leaflet choropleth map
    Dashboard.tsx    # Recharts charts panel
    StatsCard.tsx    # Summary statistic card
    Filter.tsx       # Province dropdown filter
  services/
    api.ts           # Data fetching layer (mock → real API)
  utils/
    inequality.ts    # Inequality index computation
    colorScale.ts    # Value → color mapping
  data/
    indonesia.geojson  # Simplified Indonesia province polygons
    dummyData.json     # Mock province statistics
  pages/
    Home.tsx         # Main page layout
  App.tsx
  main.tsx
```

## 🚀 Cara Menjalankan

```bash
# 1. Install dependencies
npm install

# 2. Jalankan development server
npm run dev
# → buka http://localhost:5173

# 3. Build untuk production
npm run build

# 4. Preview hasil build
npm run preview
```

## 🔌 Mengganti dengan API Nyata

Edit `src/services/api.ts` dan ganti fungsi `fetchProvinceData` dengan panggilan ke endpoint Metabase kalian:

```ts
const res = await fetch('https://metabase.example.com/api/card/XX/query/json');
const raw = await res.json();
return enrichWithInequality(raw);
```

Format data yang diharapkan:

```json
[
  { "province": "Jawa Timur", "poverty": 10.5, "income": 55000 }
]
```

## 📐 Indeks Ketimpangan

```
indeks = (poverty_rate) / (income_per_capita / 10000)
```

Nilai lebih tinggi → ketimpangan lebih besar.


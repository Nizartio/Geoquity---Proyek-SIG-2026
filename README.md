# Geoquity — Dashboard GIS Ketimpangan Ekonomi Indonesia

Geoquity adalah dashboard berbasis web untuk eksplorasi ketimpangan ekonomi tingkat provinsi di Indonesia. Aplikasi menampilkan peta choropleth, ringkasan statistik, dan beberapa grafik interaktif untuk membandingkan provinsi berdasarkan data BPS.

## Ringkasan Fitur

- Peta choropleth interaktif (level provinsi) dengan tooltip dan seleksi provinsi.
- Panel ringkasan (Infographic) dengan filter provinsi dan statistik cepat.
- Panel statistik kanan berisi kartu metrik utama (kemiskinan, pendapatan, indeks ketimpangan).
- Panel bawah berisi grafik horizontal (bar/pie).
- Ketiga panel ini dapat dicollapse
- Slider tahun yang menampilkan nilai saat digeser tetapi hanya mengganti dataset saat pengguna melepas (commit-on-release).
- Warna peta dan palet grafik tersentralisasi di `src/utils/colors.ts` dan `src/utils/colorScale.ts`.

## Tech stack

- React + Vite + TypeScript
- Tailwind CSS
- Leaflet (`react-leaflet`) untuk peta
- Recharts untuk grafik
- Supabase sebagai penyimpanan data (Postgres)

## Struktur penting (singkat)

```
src/
  components/
    Map.tsx          # Leaflet map + GeoJSON handling (tahun-aware)
    Dashboard.tsx    # Grafik dan charts
    YearSlider.tsx   # Slider tahun (commit-on-release)
    Filter.tsx       # Dropdown provinsi
  services/
    api.ts           # Layer akses data (Supabase client)
  utils/
    colorScale.ts
    colors.ts
    palettes.ts
    inequality.ts
  data/
    indonesia-provinces.json  # GeoJSON provinsi (primary)
pages/
  Home.tsx            # Layout, overlay panels, map wiring
```

## Data & Supabase

Proyek ini menggunakan Supabase (Postgres) sebagai sumber data. Secara default `src/services/api.ts` sudah dikonfigurasi untuk membaca dari Supabase — sebagai pengembang pastikan environment variables berikut tersedia saat menjalankan dev server atau build:

- `VITE_SUPABASE_URL` — URL Supabase project
- `VITE_SUPABASE_ANON_KEY` — public anon key (atau service role key untuk server-side calls)

Contoh tabel yang digunakan (nama tabel: `data_ketimpangan`):

| kolom     | tipe    | keterangan |
|-----------|---------|------------|
| id        | serial  | primary key |
| tahun     | integer | tahun data (mis. 2022) |
| province  | text    | nama provinsi (dinormalisasi) |
| poverty   | numeric | persentase kemiskinan |
| income    | numeric | pendapatan per kapita |
| inequality| numeric | indeks ketimpangan (hitung lokal) |

Jika Anda belum menyiapkan Supabase, Anda bisa menggunakan file mock/data lokal pada `src/services/api.ts` untuk pengembangan cepat.

## GeoJSON historis (Papua sebelum 2024)

- Sumber GeoJSON utama: `src/data/indonesia-provinces.json`.
- Untuk menampilkan batas administratif historis (tahun 2020–2023) proyek menggunakan sebuah pendekatan runtime: beberapa subdivisi di wilayah Papua digabung menjadi dua entitas legacy (`Papua`, `Papua Barat`) ketika `year` berada pada rentang 2020–2023.
- Penggabungan ini dilakukan di `src/components/Map.tsx` (fungsi `loadIndonesiaProvinceGeoJson()` dan pembuatan `effectiveGeoJson`) — perubahan bersifat runtime dan tidak mengubah file sumber.

## Cara menjalankan (development)

1. Siapkan Node.js (v16+) dan npm
2. Letakkan credential Supabase di file `.env` di root proyek (gunakan var `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`) atau ekspor environment variabel.

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

## Build & Preview (production)

```bash
npm run build
npm run preview
```

## Perilaku UI dan pengembangan

- Slider tahun: `src/components/YearSlider.tsx` menampilkan nilai saat digeser tetapi hanya memanggil onChange ketika pengguna melepas/mengakhiri interaksi.
- Panel kiri (Infographic) dan kanan (Stats) dapat dicollapse menjadi bar sempit; animasi transisi dioptimalkan untuk lebar, padding, transform, dan opacity.
- Tombol `Kembali ke Indonesia` di header memicu reconter pada peta (lihat `pages/Home.tsx` untuk sinyal `recenterSignal`).

## Pengembang: file yang perlu diperhatikan

- `src/components/Map.tsx` — logika pemuatan GeoJSON, styling layer, dan merging Papua untuk tahun historis.
- `src/services/api.ts` — fungsi akses data ke Supabase (`fetchProvinceData`, `fetchYearRange`).
- `src/components/YearSlider.tsx` — perilaku slider commit-on-release dan bubble indicator.
- `src/utils/colors.ts` & `src/utils/colorScale.ts` — definisi warna dan skala choropleth.

## Lisensi & Kontribusi

Proyek ini dibuat untuk tujuan pembelajaran akademik. Silakan hubungi kontributor proyek untuk diskusi lebih lanjut tentang penggunaan atau kontribusi.

---

Jika Anda mau, saya bisa:

- Menambahkan tautan file langsung di README ke `Map.tsx` dan `YearSlider.tsx`.
- Membuat file `DEVELOPER_NOTES.md` yang menjelaskan lebih detil fungsi penggabungan GeoJSON.

Beritahu mana yang Anda ingin tambahkan selanjutnya.

## 🗂️ Data dan GeoJSON historis

- Proyek ini memuat GeoJSON provinsi Indonesia dari `src/data/indonesia-provinces.json`.
- Untuk mempertahankan batas administratif historis sebelum 2024, aplikasi juga memakai satu sumber GeoJSON terpisah (disimpan dalam proyek) yang digunakan saat menampilkan peta untuk tahun-tahun 2020–2023. Pada rentang tahun tersebut, beberapa subdivisi di Papua digabung secara runtime menjadi dua entitas legacy: `Papua` dan `Papua Barat`.
- Implementasi penggabungan dilakukan di `src/components/Map.tsx` — ini bersifat runtime (tidak memodifikasi file sumber). Jika Anda ingin mengubah perilaku atau memperbarui file GeoJSON, lihat fungsi `loadIndonesiaProvinceGeoJson()` dan cabang yang membentuk `effectiveGeoJson` berdasarkan prop `year`.

## ℹ️ Catatan Fitur & UX

- Slider tahun (`src/components/YearSlider.tsx`) menampilkan nilai saat digeser tapi hanya mengubah dataset ketika pengguna melepas (commit-on-release).
- Panel kiri (Infographic), kanan (Stats) dan tray bawah memiliki mode collapse; peralihan animasi dioptimalkan untuk mengurangi getaran layout (transisi lebar, padding, transform, opacity).

## 🧭 Menjalankan dan pengembangan

Pastikan Node.js (v16+) dan npm terpasang lalu jalankan:

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

Untuk mempersiapkan production build:

```bash
npm run build
npm run preview
```

Jika Anda menggunakan Supabase/Metabase atau sumber data lain, sesuaikan `src/services/api.ts`.


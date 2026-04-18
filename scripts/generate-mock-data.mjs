import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourcePath = path.join(rootDir, 'src', 'data', 'indonesia-provinces.json');
const targetPath = path.join(rootDir, 'src', 'data', 'dummyData.json');

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function toTitleCase(value) {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeProvinceName(rawName) {
  const key = rawName.trim().toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ');
  const aliasMap = {
    'DAERAH KHUSUS IBUKOTA JAKARTA': 'DKI Jakarta',
    'DAERAH ISTIMEWA YOGYAKARTA': 'DI Yogyakarta',
    'DI ACEH': 'Aceh',
    'BANGKA BELITUNG': 'Kepulauan Bangka Belitung',
    'IRIAN JAYA': 'Papua',
    'IRIAN JAYA BARAT': 'Papua Barat',
    'IRIAN JAYA TENGAH': 'Papua Tengah',
    'IRIAN JAYA TIMUR': 'Papua',
  };

  return aliasMap[key] ?? toTitleCase(key);
}

function getProfile(province) {
  if (province.includes('Papua')) return { poverty: [17, 31], income: [42000, 62000] };
  if (province.includes('Maluku')) return { poverty: [8, 20], income: [45000, 70000] };
  if (province.includes('Nusa Tenggara')) return { poverty: [11, 24], income: [38000, 62000] };
  if (province.includes('Sulawesi')) return { poverty: [6, 16], income: [47000, 73000] };
  if (province.includes('Kalimantan')) return { poverty: [4, 11], income: [56000, 94000] };
  if (province.startsWith('Jawa') || province === 'Banten' || province === 'DKI Jakarta') {
    return { poverty: [3, 12], income: [52000, 125000] };
  }
  if (province.includes('Sumatera') || province === 'Aceh' || province === 'Riau') {
    return { poverty: [5, 15], income: [50000, 78000] };
  }
  if (province === 'Bali') return { poverty: [3, 8], income: [58000, 86000] };
  if (province.includes('Kepulauan')) return { poverty: [4, 10], income: [58000, 86000] };
  return { poverty: [5, 14], income: [47000, 78000] };
}

function randomInRange(rng, min, max) {
  return min + rng() * (max - min);
}

function toOneDecimal(value) {
  return Math.round(value * 10) / 10;
}

function toNearestHundred(value) {
  return Math.round(value / 100) * 100;
}

async function main() {
  const seedArg = process.argv.find((arg) => arg.startsWith('--seed='));
  const seed = seedArg ? Number(seedArg.split('=')[1]) : new Date().getFullYear();

  if (!Number.isFinite(seed)) {
    throw new Error('Invalid seed. Use --seed=<number>.');
  }

  const rng = seededRandom(seed);
  const geojsonRaw = await readFile(sourcePath, 'utf8');
  const geojson = JSON.parse(geojsonRaw);

  const provinceNames = Array.from(
    new Set(
      (geojson.features ?? [])
        .map((feature) => feature?.properties?.PROVINSI ?? feature?.properties?.Propinsi)
        .filter(Boolean)
        .map((name) => normalizeProvinceName(String(name)))
    )
  );

  const rows = provinceNames.map((province) => {
    const profile = getProfile(province);
    const poverty = toOneDecimal(randomInRange(rng, profile.poverty[0], profile.poverty[1]));
    const income = toNearestHundred(randomInRange(rng, profile.income[0], profile.income[1]));
    return { province, poverty, income };
  });

  rows.sort((a, b) => a.province.localeCompare(b.province, 'id-ID'));

  await writeFile(targetPath, JSON.stringify(rows, null, 2) + '\n', 'utf8');
  console.log(`Generated ${rows.length} mock rows -> src/data/dummyData.json (seed=${seed})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jkylndmvrladdaryrrlw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gPs8Dj_OlvEHaPrf9n7pEA_9TZFqyJ0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase
    .from('data_ketimpangan')
    .select('no, kode_provinsi, nama_provinsi, tahun, pdrb_per_kapita, persen_miskin, rasio_gini')
    .limit(10);

  if (error) {
    console.error('Error fetching:', error);
    process.exit(1);
  }

  console.log('Fetched rows (up to 10):', data?.length ?? 0);
  console.log(data);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
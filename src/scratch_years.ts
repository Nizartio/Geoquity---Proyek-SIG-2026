import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jkylndmvrladdaryrrlw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gPs8Dj_OlvEHaPrf9n7pEA_9TZFqyJ0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('data_ketimpangan').select('tahun');
  if (error) console.error(error);
  else {
    const years = [...new Set(data.map(d => d.tahun))].sort();
    console.log('Available years:', years);
  }
}
run();

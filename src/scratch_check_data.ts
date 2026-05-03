import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jkylndmvrladdaryrrlw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_gPs8Dj_OlvEHaPrf9n7pEA_9TZFqyJ0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('data_ketimpangan').select('*').eq('tahun', 2025).limit(5);
  console.log('2025 Data Sample:', data);
}
run();

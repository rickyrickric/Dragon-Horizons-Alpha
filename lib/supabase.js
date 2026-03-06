import { createClient } from '@supabase/supabase-js';

// Validate required environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ CRITICAL: Missing required environment variables');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing');
  console.error('   SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✓ Set' : '✗ Missing');
  console.error('\n   Please set these environment variables in your .env file');
  console.error('   See .env.example for the required format\n');
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

async function recordServerEntry(entry) {
  const { data, error } = await supabase
    .from('server_entries')
    .insert([entry]);
  return { data, error };
}

async function getServerEntries({ limit = 100, offset = 0 } = {}) {
  const from = offset;
  const to = offset + limit - 1;
  const { data, error } = await supabase
    .from('server_entries')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to);
  return { data, error };
}

async function getServerEntryById(id) {
  const { data, error } = await supabase
    .from('server_entries')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

export { supabase, recordServerEntry, getServerEntries, getServerEntryById };
export default supabase;

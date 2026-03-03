import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // service role key — server only, never exposed
);

async function recordServerEntry(entry) {
  // entry should be an object matching your DB columns, e.g.
  // { nickname, discord, aternos, ip, user_agent, source, created_at }
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
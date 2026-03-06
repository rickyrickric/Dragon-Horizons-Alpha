import supabase from '../supabase.js';
import { ConfigRepository } from './ConfigRepository.js';

export class SupabaseConfigRepository extends ConfigRepository {
  _checkSupabase() { if (!supabase) return { error: new Error('Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.') }; return null; }

  async getAll() { const checkError = this._checkSupabase(); if (checkError) return checkError; const { data, error } = await supabase.from('site_config').select('key, value'); return { data, error }; }

  async get(key) { const checkError = this._checkSupabase(); if (checkError) return null; const { data, error } = await supabase.from('site_config').select('value').eq('key', key).maybeSingle(); if (error) return null; return data?.value || null; }

  async upsert(key, value) { const checkError = this._checkSupabase(); if (checkError) return checkError; const { data, error } = await supabase.from('site_config').upsert({ key, value }, { onConflict: 'key' }); return { data, error }; }

  async delete(key) { const { error } = await supabase.from('site_config').delete().eq('key', key); return { error }; }
}

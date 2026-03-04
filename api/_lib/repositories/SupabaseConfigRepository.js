/**
 * SupabaseConfigRepository
 * 
 * Concrete implementation of ConfigRepository using Supabase.
 * Handles site configuration key-value storage.
 */

import supabase from '../supabase.js';
import { ConfigRepository } from './ConfigRepository.js';

export class SupabaseConfigRepository extends ConfigRepository {
  async getAll() {
    const { data, error } = await supabase
      .from('site_config')
      .select('key, value');
    return { data, error };
  }

  async get(key) {
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    
    if (error) return null;
    return data?.value || null;
  }

  async upsert(key, value) {
    const { data, error } = await supabase
      .from('site_config')
      .upsert({ key, value }, { onConflict: 'key' });
    return { data, error };
  }

  async delete(key) {
    const { error } = await supabase
      .from('site_config')
      .delete()
      .eq('key', key);
    return { error };
  }
}

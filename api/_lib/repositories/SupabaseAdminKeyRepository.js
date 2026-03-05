/**
 * SupabaseAdminKeyRepository
 * 
 * Concrete implementation of AdminKeyRepository using Supabase.
 * Manages the 3 admin access keys: event, maintenance, status
 */

import supabase from '../supabase.js';
import { AdminKeyRepository } from './AdminKeyRepository.js';

const ALLOWED_KEYS = ['event', 'maintenance', 'status'];

export class SupabaseAdminKeyRepository extends AdminKeyRepository {
  _checkSupabase() {
    if (!supabase) {
      return {
        error: new Error('Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.')
      };
    }
    return null;
  }

  async getAll() {
    const checkError = this._checkSupabase();
    if (checkError) return checkError;

    const { data, error } = await supabase
      .from('admin_keys')
      .select('key_name, description, created_at, updated_at');
    
    // Filter to only return metadata, not actual key values
    const safeData = (data || []).map(k => ({
      key_name: k.key_name,
      description: k.description,
      created_at: k.created_at,
      updated_at: k.updated_at,
      key_value: '***hidden***' // Never expose actual key values
    }));
    
    return { data: safeData, error };
  }

  async getByName(key_name) {
    if (!ALLOWED_KEYS.includes(key_name)) {
      return { data: null, error: { message: 'Invalid key name' } };
    }

    const checkError = this._checkSupabase();
    if (checkError) return checkError;

    const { data, error } = await supabase
      .from('admin_keys')
      .select('key_name, description, created_at, updated_at')
      .eq('key_name', key_name)
      .maybeSingle();
    
    if (data) {
      data.key_value = '***hidden***';
    }
    
    return { data, error };
  }

  async verify(key_name, provided_value) {
    const checkError = this._checkSupabase();
    if (checkError) return { valid: false, error: checkError.error };

    if (!ALLOWED_KEYS.includes(key_name)) {
      return false;
    }

    const { data, error } = await supabase
      .from('admin_keys')
      .select('key_value')
      .eq('key_name', key_name)
      .maybeSingle();
    
    if (error || !data) return false;
    
    // Simple string comparison (in production, consider using bcrypt)
    return data.key_value === provided_value;
  }

  async update(key_name, new_value) {
    if (!ALLOWED_KEYS.includes(key_name)) {
      return { data: null, error: { message: 'Invalid key name' } };
    }

    const { data, error } = await supabase
      .from('admin_keys')
      .update({ 
        key_value: new_value,
        updated_at: new Date().toISOString()
      })
      .eq('key_name', key_name)
      .select()
      .single();
    
    if (data) {
      data.key_value = '***hidden***';
    }
    
    return { data, error };
  }

  async upsert(key_name, value, description = '') {
    if (!ALLOWED_KEYS.includes(key_name)) {
      return { data: null, error: { message: 'Invalid key name' } };
    }

    const { data, error } = await supabase
      .from('admin_keys')
      .upsert(
        {
          key_name,
          key_value: value,
          description,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'key_name' }
      )
      .select()
      .single();
    
    if (data) {
      data.key_value = '***hidden***';
    }
    
    return { data, error };
  }
}

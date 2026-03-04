/**
 * SupabaseApplicationRepository
 * 
 * Concrete implementation of ApplicationRepository using Supabase.
 * Handles all application CRUD operations.
 */

import supabase from '../supabase.js';
import { ApplicationRepository } from './ApplicationRepository.js';

export class SupabaseApplicationRepository extends ApplicationRepository {
  async insert(payload) {
    const { data, error } = await supabase
      .from('applications')
      .insert(payload)
      .select()
      .single();
    return { data, error };
  }

  async findExisting(aternos_username) {
    const { data } = await supabase
      .from('applications')
      .select('id, status')
      .eq('aternos_username', aternos_username)
      .in('status', ['pending', 'accepted'])
      .maybeSingle();
    return data;
  }

  async getAll(status) {
    let query = supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    return { data, error };
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    return { data, error };
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }

  async delete(id) {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);
    return { error };
  }
}

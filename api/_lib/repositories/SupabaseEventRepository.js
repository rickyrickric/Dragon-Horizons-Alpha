/**
 * SupabaseEventRepository
 * 
 * Concrete implementation of EventRepository using Supabase.
 * Handles all event CRUD operations for countdown timers.
 */

import supabase from '../supabase.js';
import { EventRepository } from './EventRepository.js';

export class SupabaseEventRepository extends EventRepository {
  _checkSupabase() {
    if (!supabase) {
      return {
        error: new Error('Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.')
      };
    }
    return null;
  }

  /**
   * Get all active events ordered by event_time
   */
  async getActive() {
    const checkError = this._checkSupabase();
    if (checkError) return checkError;

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('event_time', { ascending: true });
    
    return { data, error };
  }

  /**
   * Get next upcoming event (earliest time that hasn't passed)
   */
  async getNext() {
    const checkError = this._checkSupabase();
    if (checkError) return checkError;

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .gt('event_time', now)
      .order('event_time', { ascending: true })
      .limit(1)
      .maybeSingle();
    
    return { data, error };
  }

  /**
   * Create new event
   */
  async create(payload) {
    const checkError = this._checkSupabase();
    if (checkError) return checkError;

    const { data, error } = await supabase
      .from('events')
      .insert({
        event_type: payload.event_type,
        description: payload.description,
        event_time: payload.event_time,
        is_active: true
      })
      .select()
      .single();
    
    return { data, error };
  }

  /**
   * Update event details
   */
  async update(id, updates) {
    const checkError = this._checkSupabase();
    if (checkError) return checkError;

    const { data, error } = await supabase
      .from('events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  /**
   * Delete event (soft delete via is_active)
   */
  async delete(id) {
    const checkError = this._checkSupabase();
    if (checkError) return checkError;

    const { error } = await supabase
      .from('events')
      .update({ is_active: false })
      .eq('id', id);
    
    return { error };
  }
}

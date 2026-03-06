import supabase from '../supabase.js';
import { EventRepository } from './EventRepository.js';

export class SupabaseEventRepository extends EventRepository {
  _checkSupabase() { if (!supabase) return { error: new Error('Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.') }; return null; }

  async getActive() { const checkError = this._checkSupabase(); if (checkError) return checkError; const { data, error } = await supabase.from('events').select('*').eq('is_active', true).order('event_time', { ascending: true }); return { data, error }; }

  async getNext() { const checkError = this._checkSupabase(); if (checkError) return checkError; const now = new Date().toISOString(); const { data, error } = await supabase.from('events').select('*').eq('is_active', true).gt('event_time', now).order('event_time', { ascending: true }).limit(1).maybeSingle(); return { data, error }; }

  async create(payload) { const checkError = this._checkSupabase(); if (checkError) return checkError; const { data, error } = await supabase.from('events').insert({ event_type: payload.event_type, description: payload.description, event_time: payload.event_time, is_active: true }).select().single(); return { data, error }; }

  async update(id, updates) { const checkError = this._checkSupabase(); if (checkError) return checkError; const { data, error } = await supabase.from('events').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id).select().single(); return { data, error }; }

  async delete(id) { const checkError = this._checkSupabase(); if (checkError) return checkError; const { error } = await supabase.from('events').update({ is_active: false }).eq('id', id); return { error }; }
}

import supabase from '../supabase.js';
import { ModRecommendationRepository } from './ModRecommendationRepository.js';

export class SupabaseModRecommendationRepository extends ModRecommendationRepository {
  _checkSupabase() { if (!supabase) return { error: new Error('Database not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.') }; return null; }

  async insert(payload) { const checkError = this._checkSupabase(); if (checkError) return checkError; const { data, error } = await supabase.from('mod_recommendations').insert({ submitter_name: payload.submitter_name, submitter_discord: payload.submitter_discord, mod_name: payload.mod_name, mod_link: payload.mod_link, mod_category: payload.mod_category || null, reason: payload.reason || null, status: 'pending' }).select().single(); return { data, error }; }

  async getAll(status = null) { const checkError = this._checkSupabase(); if (checkError) return checkError; let query = supabase.from('mod_recommendations').select('*').order('created_at', { ascending: false }); if (status) { query = query.eq('status', status); } const { data, error } = await query; return { data, error }; }

  async getById(id) { const checkError = this._checkSupabase(); if (checkError) return checkError; const { data, error } = await supabase.from('mod_recommendations').select('*').eq('id', id).maybeSingle(); return { data, error }; }

  async updateStatus(id, status, admin_comment = null) { const checkError = this._checkSupabase(); if (checkError) return checkError; const updates = { status, reviewed_at: new Date().toISOString() }; if (admin_comment) updates.admin_comment = admin_comment; const { data, error } = await supabase.from('mod_recommendations').update(updates).eq('id', id).select().single(); return { data, error }; }

  async delete(id) { const checkError = this._checkSupabase(); if (checkError) return checkError; const { error } = await supabase.from('mod_recommendations').delete().eq('id', id); return { error }; }

  async count(status = null) { const checkError = this._checkSupabase(); if (checkError) return checkError; let query = supabase.from('mod_recommendations').select('id', { count: 'exact', head: true }); if (status) { query = query.eq('status', status); } const { count, error } = await query; return { data: count || 0, error }; }
}

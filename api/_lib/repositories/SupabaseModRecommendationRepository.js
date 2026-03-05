/**
 * SupabaseModRecommendationRepository
 * 
 * Concrete implementation of ModRecommendationRepository using Supabase.
 * Handles all mod recommendation CRUD operations.
 * Follows SOLID principles: Single Responsibility, Interface Segregation, Dependency Inversion
 */

import supabase from '../supabase.js';
import { ModRecommendationRepository } from './ModRecommendationRepository.js';

export class SupabaseModRecommendationRepository extends ModRecommendationRepository {
  /**
   * Insert a new mod recommendation
   * @param {Object} payload
   * @returns {Promise<{data: ModRecommendation, error: ?Object}>}
   */
  async insert(payload) {
    const { data, error } = await supabase
      .from('mod_recommendations')
      .insert({
        submitter_name: payload.submitter_name,
        submitter_discord: payload.submitter_discord,
        mod_name: payload.mod_name,
        mod_link: payload.mod_link,
        mod_category: payload.mod_category || null,
        reason: payload.reason || null,
        status: 'pending'
      })
      .select()
      .single();
    
    return { data, error };
  }

  /**
   * Get all recommendations with optional status filter
   * @param {string?} status - Optional status filter
   * @returns {Promise<{data: ModRecommendation[], error: ?Object}>}
   */
  async getAll(status = null) {
    let query = supabase
      .from('mod_recommendations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    return { data, error };
  }

  /**
   * Get single recommendation by ID
   * @param {string} id
   * @returns {Promise<{data: ModRecommendation?, error: ?Object}>}
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('mod_recommendations')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    return { data, error };
  }

  /**
   * Update recommendation status and admin comment
   * @param {string} id
   * @param {string} status
   * @param {string?} admin_comment
   * @returns {Promise<{data: ModRecommendation, error: ?Object}>}
   */
  async updateStatus(id, status, admin_comment = null) {
    const updates = {
      status,
      reviewed_at: new Date().toISOString()
    };
    
    if (admin_comment) {
      updates.admin_comment = admin_comment;
    }
    
    const { data, error } = await supabase
      .from('mod_recommendations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    return { data, error };
  }

  /**
   * Delete recommendation by ID
   * @param {string} id
   * @returns {Promise<{error: ?Object}>}
   */
  async delete(id) {
    const { error } = await supabase
      .from('mod_recommendations')
      .delete()
      .eq('id', id);
    
    return { error };
  }

  /**
   * Get count of recommendations by status
   * @param {string?} status
   * @returns {Promise<{data: number, error: ?Object}>}
   */
  async count(status = null) {
    let query = supabase
      .from('mod_recommendations')
      .select('id', { count: 'exact', head: true });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { count, error } = await query;
    return { data: count || 0, error };
  }
}

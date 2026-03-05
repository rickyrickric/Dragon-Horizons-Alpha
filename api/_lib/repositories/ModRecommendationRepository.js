/**
 * ModRecommendationRepository
 * 
 * Abstract repository interface for mod recommendations.
 * Defines contract for mod recommendation data access operations.
 * Implementations support both Supabase and Firestore.
 * 
 * @typedef {Object} ModRecommendation
 * @property {string} id - Unique identifier
 * @property {string} submitter_name - Recommender's name
 * @property {string} submitter_discord - Discord tag
 * @property {string} mod_name - Name of recommended mod
 * @property {string} mod_link - Download/curseforge link
 * @property {string?} mod_category - Category (optional)
 * @property {string?} reason - Why they recommend it
 * @property {string} status - 'pending' | 'approved' | 'denied'
 * @property {string?} admin_comment - Admin's decision reason
 * @property {string} created_at - Submission timestamp
 * @property {string?} reviewed_at - Review timestamp
 */

/**
 * @interface IModRecommendationRepository
 */
export class ModRecommendationRepository {
  /**
   * Insert a new mod recommendation
   * @param {Omit<ModRecommendation, 'id'|'created_at'|'reviewed_at'>} payload
   * @returns {Promise<{data: ModRecommendation, error: ?Object}>}
   */
  async insert(payload) {
    throw new Error('Not implemented');
  }

  /**
   * Get all recommendations with optional filters
   * @param {string?} status - Filter by status ('pending', 'approved', 'denied')
   * @returns {Promise<{data: ModRecommendation[], error: ?Object}>}
   */
  async getAll(status = null) {
    throw new Error('Not implemented');
  }

  /**
   * Get single recommendation by ID
   * @param {string} id - Recommendation ID
   * @returns {Promise<{data: ModRecommendation?, error: ?Object}>}
   */
  async getById(id) {
    throw new Error('Not implemented');
  }

  /**
   * Update recommendation status and admin comment
   * @param {string} id - Recommendation ID
   * @param {string} status - New status
   * @param {string?} admin_comment - Admin's decision reason
   * @returns {Promise<{data: ModRecommendation, error: ?Object}>}
   */
  async updateStatus(id, status, admin_comment = null) {
    throw new Error('Not implemented');
  }

  /**
   * Delete recommendation by ID
   * @param {string} id - Recommendation ID
   * @returns {Promise<{error: ?Object}>}
   */
  async delete(id) {
    throw new Error('Not implemented');
  }

  /**
   * Get count of recommendations by status
   * @param {string?} status - Optional status filter
   * @returns {Promise<{data: number, error: ?Object}>}
   */
  async count(status = null) {
    throw new Error('Not implemented');
  }
}

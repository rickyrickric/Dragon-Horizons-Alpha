/**
 * ApplicationRepository Interface
 * 
 * Defines contract for application data access operations.
 * Implementations must support both Supabase and Firestore.
 * 
 * @typedef {Object} Application
 * @property {string} id
 * @property {string} nickname
 * @property {string} discord
 * @property {string} aternos_username
 * @property {string} reason
 * @property {string} status - 'pending' | 'accepted' | 'rejected'
 * @property {string?} admin_note
 * @property {string} created_at
 * @property {string?} reviewed_at
 */

/**
 * @interface IApplicationRepository
 */
export class ApplicationRepository {
  /**
   * Insert a new application
   * @param {Application} payload - Application data
   * @returns {Promise<{data: Application, error: ?Object}>}
   */
  async insert(payload) {
    throw new Error('Not implemented');
  }

  /**
   * Find existing application by aternos username
   * @param {string} aternos_username
   * @returns {Promise<Application?>}
   */
  async findExisting(aternos_username) {
    throw new Error('Not implemented');
  }

  /**
   * Get all applications with optional status filter
   * @param {string?} status - Optional status filter
   * @returns {Promise<{data: Application[], error: ?Object}>}
   */
  async getAll(status) {
    throw new Error('Not implemented');
  }

  /**
   * Get application by ID
   * @param {string} id
   * @returns {Promise<{data: Application?, error: ?Object}>}
   */
  async getById(id) {
    throw new Error('Not implemented');
  }

  /**
   * Update application
   * @param {string} id
   * @param {Partial<Application>} updates
   * @returns {Promise<{data: Application, error: ?Object}>}
   */
  async update(id, updates) {
    throw new Error('Not implemented');
  }

  /**
   * Delete application
   * @param {string} id
   * @returns {Promise<{error: ?Object}>}
   */
  async delete(id) {
    throw new Error('Not implemented');
  }
}

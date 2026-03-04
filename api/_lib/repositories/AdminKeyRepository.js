/**
 * AdminKeyRepository Interface
 * 
 * Manages admin access keys.
 * Three keys: event, maintenance, status
 * 
 * @typedef {Object} AdminKey
 * @property {string} key_name - 'event' | 'maintenance' | 'status'
 * @property {string} key_value - The secret key value
 * @property {string} description - Human-readable description
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @interface IAdminKeyRepository
 */
export class AdminKeyRepository {
  /**
   * Get all admin keys (values hidden for security)
   * @returns {Promise<{data: AdminKey[], error: ?Object}>}
   */
  async getAll() {
    throw new Error('Not implemented');
  }

  /**
   * Get single admin key by name
   * @param {string} key_name - 'event' | 'maintenance' | 'status'
   * @returns {Promise<{data: AdminKey?, error: ?Object}>}
   */
  async getByName(key_name) {
    throw new Error('Not implemented');
  }

  /**
   * Verify admin key (check if provided value matches stored)
   * @param {string} key_name
   * @param {string} provided_value
   * @returns {Promise<boolean>}
   */
  async verify(key_name, provided_value) {
    throw new Error('Not implemented');
  }

  /**
   * Update admin key value
   * @param {string} key_name
   * @param {string} new_value
   * @returns {Promise<{data: AdminKey, error: ?Object}>}
   */
  async update(key_name, new_value) {
    throw new Error('Not implemented');
  }

  /**
   * Create or reset admin key
   * @param {string} key_name
   * @param {string} value
   * @param {string} description
   * @returns {Promise<{data: AdminKey, error: ?Object}>}
   */
  async upsert(key_name, value, description) {
    throw new Error('Not implemented');
  }
}

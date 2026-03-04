/**
 * ConfigRepository Interface
 * 
 * Defines contract for site configuration data access.
 * Stores key-value pairs for site settings.
 * 
 * @typedef {Object} ConfigEntry
 * @property {string} key
 * @property {string} value
 */

/**
 * @interface IConfigRepository
 */
export class ConfigRepository {
  /**
   * Get all configuration entries
   * @returns {Promise<{data: ConfigEntry[], error: ?Object}>}
   */
  async getAll() {
    throw new Error('Not implemented');
  }

  /**
   * Get single configuration value
   * @param {string} key
   * @returns {Promise<?string>}
   */
  async get(key) {
    throw new Error('Not implemented');
  }

  /**
   * Upsert (insert or update) configuration entry
   * @param {string} key
   * @param {string} value
   * @returns {Promise<{data: ConfigEntry[], error: ?Object}>}
   */
  async upsert(key, value) {
    throw new Error('Not implemented');
  }

  /**
   * Delete configuration entry
   * @param {string} key
   * @returns {Promise<{error: ?Object}>}
   */
  async delete(key) {
    throw new Error('Not implemented');
  }
}

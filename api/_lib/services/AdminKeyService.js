/**
 * AdminKeyService
 * 
 * Business logic for admin key management and verification.
 * Handles the 3 admin keys: event, maintenance, status
 * 
 * These keys are completely separate from the HTTP Authorization header.
 * They control access to specific admin functionality on the frontend.
 */

export class AdminKeyService {
  constructor(adminKeyRepository) {
    this.repo = adminKeyRepository;
  }

  /**
   * Verify if provided key matches the stored key for given function
   * 
   * @param {string} keyName - 'event', 'maintenance', or 'status'
   * @param {string} providedValue - Key value to verify
   * @returns {Promise<{success: boolean, hasKey: boolean}>}
   */
  async verifyKey(keyName, providedValue) {
    try {
      const isValid = await this.repo.verify(keyName, providedValue);
      return { success: true, hasKey: isValid };
    } catch (err) {
      return { success: false, hasKey: false };
    }
  }

  /**
   * Get all admin keys (metadata only, values always hidden)
   * 
   * @returns {Promise<{success: boolean, data?: AdminKey[], error?: string}>}
   */
  async getAllKeys() {
    try {
      const { data, error } = await this.repo.getAll();
      if (error) {
        return { success: false, error: 'Failed to load admin keys.' };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get admin key metadata by name (value always hidden)
   * 
   * @param {string} keyName
   * @returns {Promise<{success: boolean, data?: AdminKey, error?: string}>}
   */
  async getKey(keyName) {
    try {
      const { data, error } = await this.repo.getByName(keyName);
      if (error || !data) {
        return { success: false, error: 'Key not found.' };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Update an admin key (change its value)
   * Requires ADMIN_SECRET HTTP authentication
   * 
   * @param {string} keyName
   * @param {string} newValue
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async updateKey(keyName, newValue) {
    try {
      if (!newValue || String(newValue).trim().length === 0) {
        return { success: false, error: 'Key value cannot be empty.' };
      }

      const { error } = await this.repo.update(keyName, String(newValue).trim());
      if (error) {
        return { success: false, error: 'Failed to update key.' };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Initialize admin keys (called during setup)
   * Creates default keys if they don't exist
   * 
   * @param {Object} keyValues - { event: string, maintenance: string, status: string }
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async initializeKeys(keyValues) {
    try {
      const keys = ['event', 'maintenance', 'status'];
      
      for (const keyName of keys) {
        const value = keyValues[keyName] || this._generateDefaultKey(keyName);
        const description = this._getKeyDescription(keyName);
        
        const { error } = await this.repo.upsert(keyName, value, description);
        if (error) {
          return { success: false, error: `Failed to initialize ${keyName} key.` };
        }
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Generate a random 32-character key for default setup
   * 
   * @private
   * @returns {string}
   */
  _generateDefaultKey(keyName) {
    // This would normally use a proper random generator
    // For now, using simple generation
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${keyName}_${timestamp}${random}`.substring(0, 32);
  }

  /**
   * Get human-readable description for key
   * 
   * @private
   * @returns {string}
   */
  _getKeyDescription(keyName) {
    const descriptions = {
      event: 'Key for managing server events and announcements',
      maintenance: 'Key for toggling maintenance mode on/off',
      status: 'Key for updating server status and system info'
    };
    return descriptions[keyName] || 'Admin key';
  }

  /**
   * Check if all 3 required keys exist
   * 
   * @returns {Promise<boolean>}
   */
  async keysInitialized() {
    try {
      const { success, data } = await this.getAllKeys();
      if (!success) return false;
      
      const keyNames = (data || []).map(k => k.key_name);
      return ['event', 'maintenance', 'status'].every(k => keyNames.includes(k));
    } catch (err) {
      return false;
    }
  }
}

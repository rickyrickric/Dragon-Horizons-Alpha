/**
 * ConfigService
 * 
 * Business logic for site configuration management.
 * Handles reading and writing site-wide settings.
 * 
 * Allowed config keys:
 * - drive_link: Google Drive link for mod downloads
 * - pack_version: Current modpack version
 * - server_address: Server IP/hostname
 * - server_port: Server port number
 */

const ALLOWED_CONFIG_KEYS = [
  'drive_link',
  'pack_version',
  'server_address',
  'server_port'
];

const PUBLIC_KEYS = ['drive_link', 'pack_version', 'server_address', 'server_port'];
const ADMIN_ONLY_KEYS = []; // All current keys are public

export class ConfigService {
  constructor(configRepository) {
    this.repo = configRepository;
  }

  /**
   * Get all configuration (for admin)
   * 
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async getAllConfig() {
    try {
      const { data, error } = await this.repo.getAll();
      if (error) {
        return { success: false, error: 'Failed to load configuration.' };
      }

      // Convert array format to object
      const config = Object.fromEntries(
        (data || []).map(entry => [entry.key, entry.value])
      );

      return { success: true, data: config };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get public configuration (for frontend)
   * Returns only non-sensitive settings
   * 
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async getPublicConfig() {
    try {
      const { data, error } = await this.repo.getAll();
      if (error) {
        return { success: false, error: 'Failed to load configuration.' };
      }

      // Filter to only public keys
      const publicConfig = {};
      (data || []).forEach(entry => {
        if (PUBLIC_KEYS.includes(entry.key)) {
          publicConfig[entry.key] = entry.value;
        }
      });

      return { success: true, data: publicConfig };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get single config value
   * 
   * @param {string} key
   * @returns {Promise<string?>}
   */
  async getConfigValue(key) {
    try {
      return await this.repo.get(key);
    } catch (err) {
      return null;
    }
  }

  /**
   * Update multiple configuration values
   * 
   * @param {Object} updates - Key-value pairs to update
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async updateConfig(updates) {
    try {
      const results = {};
      
      for (const [key, value] of Object.entries(updates)) {
        // Only allow known config keys
        if (!ALLOWED_CONFIG_KEYS.includes(key)) {
          continue;
        }

        const { error } = await this.repo.upsert(key, String(value));
        if (error) {
          return { 
            success: false, 
            error: `Failed to update ${key}.` 
          };
        }
        
        results[key] = value;
      }

      return { success: true, data: results };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Update single config value
   * 
   * @param {string} key
   * @param {string} value
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async setConfig(key, value) {
    try {
      // Validate key
      if (!ALLOWED_CONFIG_KEYS.includes(key)) {
        return { success: false, error: 'Invalid configuration key.' };
      }

      const { error } = await this.repo.upsert(key, String(value));
      if (error) {
        return { success: false, error: 'Failed to update configuration.' };
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get server information (address + port)
   * 
   * @returns {Promise<{address: string, port: string}>}
   */
  async getServerInfo() {
    try {
      const { data } = await this.repo.getAll();
      const config = Object.fromEntries(
        (data || []).map(e => [e.key, e.value])
      );

      return {
        address: config.server_address || 'server.example.com',
        port: config.server_port || '25565'
      };
    } catch (err) {
      return { address: 'server.example.com', port: '25565' };
    }
  }

  /**
   * Get download link
   * 
   * @returns {Promise<string>}
   */
  async getDownloadLink() {
    try {
      const link = await this.repo.get('drive_link');
      return link || 'https://drive.google.com';
    } catch (err) {
      return 'https://drive.google.com';
    }
  }

  /**
   * Get modpack version
   * 
   * @returns {Promise<string>}
   */
  async getPackVersion() {
    try {
      const version = await this.repo.get('pack_version');
      return version || 'v1.0.0';
    } catch (err) {
      return 'v1.0.0';
    }
  }
}

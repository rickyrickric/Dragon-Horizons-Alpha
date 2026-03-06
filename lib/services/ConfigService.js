export class ConfigService {
  constructor(configRepo) {
    this.repo = configRepo;
  }

  async getAllConfig() {
    try {
      const { data, error } = await this.repo.getAll();
      if (error) {
        console.error('ConfigService.getAllConfig error:', error);
        return { success: false, error: error.message || 'Failed to fetch config' };
      }
      return { success: true, data: data || [] };
    } catch (err) {
      console.error('ConfigService.getAllConfig exception:', err);
      return { success: false, error: err.message };
    }
  }

  async getPublicConfig() {
    try {
      const { data, error } = await this.repo.getAll();
      if (error) {
        console.error('ConfigService.getPublicConfig error:', error);
        return { success: false, error: error.message || 'Failed to fetch config' };
      }
      // Filter to only public config keys (don't expose internal keys)
      const publicConfig = {};
      if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.key && !item.key.startsWith('_')) {
            publicConfig[item.key] = item.value;
          }
        });
      }
      return { success: true, data: publicConfig };
    } catch (err) {
      console.error('ConfigService.getPublicConfig exception:', err);
      return { success: false, error: err.message };
    }
  }

  async getConfig(key) {
    try {
      const value = await this.repo.get(key);
      return { success: true, data: value };
    } catch (err) {
      console.error('ConfigService.getConfig exception:', err);
      return { success: false, error: err.message };
    }
  }

  async updateConfig(payload) {
    try {
      if (typeof payload !== 'object' || payload === null) {
        return { success: false, error: 'Payload must be an object' };
      }

      const updates = [];
      for (const [key, value] of Object.entries(payload)) {
        if (typeof key !== 'string' || !key.trim()) continue;
        const { error } = await this.repo.upsert(key, value);
        if (error) {
          console.error(`ConfigService.updateConfig error for key ${key}:`, error);
          updates.push({ key, success: false, error: error.message });
        } else {
          updates.push({ key, success: true, value });
        }
      }

      const failedUpdates = updates.filter(u => !u.success);
      if (failedUpdates.length > 0) {
        return { success: false, error: `Failed to update ${failedUpdates.length} config item(s)`, updates };
      }

      return { success: true, data: updates };
    } catch (err) {
      console.error('ConfigService.updateConfig exception:', err);
      return { success: false, error: err.message };
    }
  }

  async deleteConfig(key) {
    try {
      const { error } = await this.repo.delete(key);
      if (error) {
        return { success: false, error: error.message || 'Failed to delete config' };
      }
      return { success: true };
    } catch (err) {
      console.error('ConfigService.deleteConfig exception:', err);
      return { success: false, error: err.message };
    }
  }
}

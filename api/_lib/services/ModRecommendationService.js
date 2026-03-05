/**
 * ModRecommendationService
 * 
 * Business logic for mod recommendation management.
 * Handles validation, submission, filtering, and admin operations.
 * 
 * Separates business rules from data access (repository) and HTTP layers.
 * Follows SOLID principles: Single Responsibility, Dependency Inversion, Open/Closed
 */

export class ModRecommendationService {
  constructor(modRecRepo) {
    this.repo = modRecRepo;
  }

  /**
   * Submit a new mod recommendation
   * Validates input and creates pending recommendation record
   * 
   * @param {Object} payload
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async submitRecommendation(payload) {
    try {
      // Validation: Required fields
      if (!payload.submitter_name?.trim()) {
        return { success: false, error: 'Submitter name is required.' };
      }
      if (!payload.submitter_discord?.trim()) {
        return { success: false, error: 'Discord tag is required.' };
      }
      if (!payload.mod_name?.trim()) {
        return { success: false, error: 'Mod name is required.' };
      }
      if (!payload.mod_link?.trim()) {
        return { success: false, error: 'Mod link/URL is required.' };
      }

      // Validation: URL format
      if (!this._isValidUrl(payload.mod_link)) {
        return { success: false, error: 'Please provide a valid URL.' };
      }

      // Validation: Name lengths
      if (payload.submitter_name.length > 255) {
        return { success: false, error: 'Submitter name is too long (max 255 characters).' };
      }
      if (payload.mod_name.length > 255) {
        return { success: false, error: 'Mod name is too long (max 255 characters).' };
      }

      // Normalize payload
      const normalizedPayload = {
        submitter_name: payload.submitter_name.trim(),
        submitter_discord: payload.submitter_discord.trim(),
        mod_name: payload.mod_name.trim(),
        mod_link: payload.mod_link.trim(),
        mod_category: payload.mod_category?.trim() || null,
        reason: payload.reason?.trim() || null
      };

      // Insert into database
      const { data, error } = await this.repo.insert(normalizedPayload);
      if (error) {
        console.error('Insert error:', error);
        return { success: false, error: 'Failed to submit recommendation. Please try again.' };
      }

      return { success: true, data: { id: data.id, status: 'pending' } };
    } catch (err) {
      console.error('submitRecommendation error:', err);
      return { success: false, error: err.message || 'An error occurred.' };
    }
  }

  /**
   * Get all recommendations with optional status filter
   * 
   * @param {string?} status - Filter: 'pending', 'approved', 'denied'
   * @returns {Promise<{success: boolean, data?: Object[], error?: string}>}
   */
  async getRecommendations(status = null) {
    try {
      // Validate status filter if provided
      if (status && !['pending', 'approved', 'denied'].includes(status)) {
        return { success: false, error: 'Invalid status filter.' };
      }

      const { data, error } = await this.repo.getAll(status);
      if (error) {
        return { success: false, error: 'Failed to fetch recommendations.' };
      }

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get single recommendation by ID
   * 
   * @param {string} id
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async getRecommendation(id) {
    try {
      const { data, error } = await this.repo.getById(id);
      if (error || !data) {
        return { success: false, error: 'Recommendation not found.' };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Update recommendation status and admin comment (admin only)
   * 
   * @param {string} id
   * @param {string} status - 'pending', 'approved', 'denied'
   * @param {string?} admin_comment
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async updateRecommendationStatus(id, status, admin_comment = null) {
    try {
      // Validate status
      if (!['pending', 'approved', 'denied'].includes(status)) {
        return { success: false, error: 'Invalid status value.' };
      }

      // Validate comment length if provided
      if (admin_comment && admin_comment.length > 1000) {
        return { success: false, error: 'Comment is too long (max 1000 characters).' };
      }

      // Update recommendation
      const { data, error } = await this.repo.updateStatus(id, status, admin_comment);
      if (error || !data) {
        return { success: false, error: 'Failed to update recommendation.' };
      }

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete a recommendation (admin only)
   * 
   * @param {string} id
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteRecommendation(id) {
    try {
      const { error } = await this.repo.delete(id);
      if (error) {
        return { success: false, error: 'Failed to delete recommendation.' };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get statistics on recommendations
   * 
   * @returns {Promise<{success: boolean, data?: {pending: number, approved: number, denied: number}, error?: string}>}
   */
  async getStats() {
    try {
      const [pending, approved, denied] = await Promise.all([
        this.repo.count('pending'),
        this.repo.count('approved'),
        this.repo.count('denied')
      ]);

      return {
        success: true,
        data: {
          pending: pending.data || 0,
          approved: approved.data || 0,
          denied: denied.data || 0,
          total: (pending.data || 0) + (approved.data || 0) + (denied.data || 0)
        }
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Validate URL format
   * @private
   * @param {string} url
   * @returns {boolean}
   */
  _isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * ApplicationService
 * 
 * Business logic for application management.
 * Handles submission, validation, status updates, and queries.
 * 
 * Separates business rules from data access (repository) and HTTP layers.
 */

export class ApplicationService {
  constructor(applicationRepository) {
    this.repo = applicationRepository;
  }

  /**
   * Submit a new application
   * Validates uniqueness and creates pending record
   * 
   * @param {Object} payload - { nickname, discord, aternos_username, reason }
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async submitApplication(payload) {
    try {
      // Check if this aternos username already has a pending or accepted application
      const existing = await this.repo.findExisting(payload.aternos_username.trim().toLowerCase());
      if (existing) {
        const message = existing.status === 'accepted'
          ? 'This Aternos username already has access.'
          : 'An application for this Aternos username is already pending review.';
        return { success: false, error: message };
      }

      // Normalize the payload
      const normalizedPayload = {
        nickname: payload.nickname.trim(),
        discord: payload.discord.trim(),
        aternos_username: payload.aternos_username.trim().toLowerCase(),
        reason: payload.reason.trim(),
        status: 'pending',
      };

      // Insert into database
      const { data, error } = await this.repo.insert(normalizedPayload);
      if (error) {
        return { success: false, error: 'Failed to submit application. Please try again.' };
      }

      return { success: true, data: { id: data.id, status: 'pending' } };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get all applications with optional filtering
   * 
   * @param {string?} status - Filter by status: 'pending', 'accepted', 'rejected'
   * @returns {Promise<{success: boolean, data?: Application[], error?: string}>}
   */
  async getApplications(status = null) {
    try {
      const { data, error } = await this.repo.getAll(status);
      if (error) {
        return { success: false, error: 'Failed to fetch applications.' };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Get single application by ID
   * 
   * @param {string} id - Application ID
   * @returns {Promise<{success: boolean, data?: Application, error?: string}>}
   */
  async getApplication(id) {
    try {
      const { data, error } = await this.repo.getById(id);
      if (error || !data) {
        return { success: false, error: 'Application not found.' };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Update application status and optional admin note
   * 
   * @param {string} id - Application ID
   * @param {string} status - New status: 'pending', 'accepted', 'rejected'
   * @param {string?} admin_note - Optional admin note
   * @returns {Promise<{success: boolean, data?: Application, error?: string}>}
   */
  async updateApplicationStatus(id, status, admin_note = null) {
    try {
      // Validate status
      if (!['pending', 'accepted', 'rejected'].includes(status)) {
        return { success: false, error: 'Invalid status value.' };
      }

      const updates = {
        status,
        admin_note: admin_note ?? null,
        reviewed_at: new Date().toISOString()
      };

      const { data, error } = await this.repo.update(id, updates);
      if (error || !data) {
        return { success: false, error: 'Failed to update application.' };
      }

      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Delete application (admin only)
   * 
   * @param {string} id - Application ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteApplication(id) {
    try {
      const { error } = await this.repo.delete(id);
      if (error) {
        return { success: false, error: 'Failed to delete application.' };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Check if player is accepted (can download mods)
   * 
   * @param {string} aternos_username
   * @returns {Promise<boolean>}
   */
  async isAccepted(aternos_username) {
    try {
      const existing = await this.repo.findExisting(aternos_username.trim().toLowerCase());
      return existing?.status === 'accepted';
    } catch (err) {
      return false;
    }
  }

  /**
   * Get application stats (counts by status)
   * 
   * @returns {Promise<{pending: number, accepted: number, rejected: number}>}
   */
  async getStats() {
    try {
      const { success, data } = await this.getApplications();
      if (!success) return { pending: 0, accepted: 0, rejected: 0 };

      const stats = {
        pending: 0,
        accepted: 0,
        rejected: 0
      };

      (data || []).forEach(app => {
        if (app.status === 'pending') stats.pending++;
        else if (app.status === 'accepted') stats.accepted++;
        else if (app.status === 'rejected') stats.rejected++;
      });

      return stats;
    } catch (err) {
      return { pending: 0, accepted: 0, rejected: 0 };
    }
  }
}

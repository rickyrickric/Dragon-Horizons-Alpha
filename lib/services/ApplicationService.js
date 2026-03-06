export class ApplicationService {
  constructor(applicationRepository) { this.repo = applicationRepository; }
  async submitApplication(payload) {
    try {
      const existing = await this.repo.findExisting(payload.aternos_username.trim().toLowerCase());
      if (existing) {
        const message = existing.status === 'accepted'
          ? 'This Aternos username already has access.'
          : 'An application for this Aternos username is already pending review.';
        return { success: false, error: message };
      }
      const normalizedPayload = { nickname: payload.nickname.trim(), discord: payload.discord.trim(), aternos_username: payload.aternos_username.trim().toLowerCase(), reason: payload.reason.trim(), status: 'pending' };
      const { data, error } = await this.repo.insert(normalizedPayload);
      if (error) return { success: false, error: 'Failed to submit application. Please try again.' };
      return { success: true, data: { id: data.id, status: 'pending' } };
    } catch (err) { return { success: false, error: err.message }; }
  }
  async getApplications(status = null) { try { const { data, error } = await this.repo.getAll(status); if (error) return { success: false, error: 'Failed to fetch applications.' }; return { success: true, data }; } catch (err) { return { success: false, error: err.message }; } }
  async getApplication(id) { try { const { data, error } = await this.repo.getById(id); if (error || !data) return { success: false, error: 'Application not found.' }; return { success: true, data }; } catch (err) { return { success: false, error: err.message }; } }
  async updateApplicationStatus(id, status, admin_note = null) { try { if (!['pending', 'accepted', 'rejected'].includes(status)) return { success: false, error: 'Invalid status value.' }; const updates = { status, admin_note: admin_note ?? null, reviewed_at: new Date().toISOString() }; const { data, error } = await this.repo.update(id, updates); if (error || !data) return { success: false, error: 'Failed to update application.' }; return { success: true, data }; } catch (err) { return { success: false, error: err.message }; } }
  async deleteApplication(id) { try { const { error } = await this.repo.delete(id); if (error) return { success: false, error: 'Failed to delete application.' }; return { success: true }; } catch (err) { return { success: false, error: err.message }; } }
  async isAccepted(aternos_username) { try { const existing = await this.repo.findExisting(aternos_username.trim().toLowerCase()); return existing?.status === 'accepted'; } catch (err) { return false; } }
  async checkApplicationStatus(aternos_username) { try { const normalized = aternos_username.trim().toLowerCase(); const { data, error } = await this.repo.getAll(); if (error) return { success: false, error: 'Failed to check application status.' }; const app = (data || []).find(a => a.aternos_username === normalized); if (!app) return { success: false, error: 'No application found for this username.' }; return { success: true, data: { status: app.status, nickname: app.nickname, discord: app.discord, created_at: app.created_at, reviewed_at: app.reviewed_at, admin_note: app.admin_note } }; } catch (err) { return { success: false, error: err.message }; } }
  async getStats() { try { const { success, data } = await this.getApplications(); if (!success) return { pending: 0, accepted: 0, rejected: 0 }; const stats = { pending:0, accepted:0, rejected:0 }; (data || []).forEach(app => { if (app.status === 'pending') stats.pending++; else if (app.status === 'accepted') stats.accepted++; else if (app.status === 'rejected') stats.rejected++; }); return stats; } catch (err) { return { pending:0, accepted:0, rejected:0 }; } }
}

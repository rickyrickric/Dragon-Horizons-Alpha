/**
 * Status Check Endpoint
 * 
 * Public endpoint to check application status by aternos username
 * GET /api/status-check?aternos_username=username
 */

import { cors } from '../_lib/auth.js';
import { ok, fail } from '../_lib/respond.js';
import { databaseFactory } from '../_lib/factory/DatabaseFactory.js';
import { ApplicationService } from '../_lib/services/ApplicationService.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // GET /api/status-check?aternos_username=xxx
  if (req.method === 'GET') {
    const { aternos_username } = req.query;

    if (!aternos_username || typeof aternos_username !== 'string' || !aternos_username.trim()) {
      return fail(res, 'Please provide an aternos_username query parameter.', 400);
    }

    try {
      const appRepo = databaseFactory.getApplicationRepository();
      const appService = new ApplicationService(appRepo);

      const result = await appService.checkApplicationStatus(aternos_username);

      if (!result.success) {
        return fail(res, result.error, 404); // Application not found
      }

      const app = result.data;
      const statusMessages = {
        pending: 'Your application is under review. We will contact you within 1-3 days.',
        accepted: 'Congratulations! Your application has been accepted. You can now download the mod pack.',
        rejected: 'Unfortunately, your application was not accepted at this time. Please try again later.'
      };

      return ok(res, {
        status: app.status,
        message: statusMessages[app.status] || 'Unknown status',
        nickname: app.nickname,
        discord: app.discord,
        submittedAt: app.created_at,
        reviewedAt: app.reviewed_at,
        adminNote: app.status === 'rejected' ? app.admin_note : null
      });
    } catch (err) {
      console.error('Status check error:', err);
      return fail(res, 'Failed to check application status. Please try again later.', 500);
    }
  }

  return fail(res, 'Method not allowed.', 405);
}

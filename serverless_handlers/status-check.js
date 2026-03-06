import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const libDir = resolve(__dirname, '../lib');
const { cors } = await import(`file://${resolve(libDir, 'auth.js')}`);
const { ok, fail } = await import(`file://${resolve(libDir, 'respond.js')}`);
const { databaseFactory } = await import(`file://${resolve(libDir, 'factory/DatabaseFactory.js')}`);
const { ApplicationService } = await import(`file://${resolve(libDir, 'services/ApplicationService.js')}`);

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    const { aternos_username } = req.query;

    if (!aternos_username || typeof aternos_username !== 'string' || !aternos_username.trim()) {
      return fail(res, 'Please provide an aternos_username query parameter.', 400);
    }

    try {
      console.log('[status-check] Checking status for:', aternos_username);
      const appRepo = databaseFactory.getApplicationRepository();
      const appService = new ApplicationService(appRepo);

      const result = await appService.checkApplicationStatus(aternos_username);
      if (!result.success) {
        return fail(res, result.error, 404);
      }

      const app = result.data;
      const statusMessages = {
        pending: 'Your application is under review. We will contact you within 1-3 days.',
        accepted: 'Congratulations! Your application has been accepted. You can now download the mod pack.',
        rejected: 'Unfortunately, your application was not accepted at this time. Please try again later.'
      };

      const response = {
        status: app.status,
        message: statusMessages[app.status] || 'Unknown status',
        nickname: app.nickname,
        discord: app.discord,
        submittedAt: app.created_at,
        reviewedAt: app.reviewed_at,
        adminNote: app.status === 'rejected' ? app.admin_note : null
      };

      return ok(res, response);
    } catch (err) {
      console.error('[status-check] Error:', err.message || err);
      console.error('[status-check] Stack:', err.stack);
      return fail(res, 'Failed to check application status: ' + (err.message || 'Unknown error'), 500);
    }
  }

  return fail(res, 'Method not allowed.', 405);
}

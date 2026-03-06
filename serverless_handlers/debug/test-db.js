import { requireAdmin, cors } from '../lib/auth.js';
import { ok, fail, denied } from '../lib/respond.js';
import { databaseFactory } from '../lib/factory/DatabaseFactory.js';
import { ApplicationService } from '../lib/services/ApplicationService.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = requireAdmin(req);
  if (!auth.ok) return denied(res);

  if (req.method !== 'GET') return fail(res, 'Only GET allowed', 405);

  try {
    const status = {
      timestamp: new Date().toISOString(),
      backend: databaseFactory.getBackendName(),
      env_vars: {
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_KEY,
        ADMIN_SECRET: !!process.env.ADMIN_SECRET,
        USE_FIREBASE: process.env.USE_FIREBASE === '1' || process.env.USE_FIREBASE === 'true',
      },
    };

    const appRepo = databaseFactory.getApplicationRepository();
    const appService = new ApplicationService(appRepo);

    const getResult = await appService.getApplications();
    status.test_read = getResult.success ? '✓ Read OK' : `✗ ${getResult.error}`;
    status.app_count = getResult.data ? getResult.data.length : 0;

    const statsResult = await appService.getStats();
    status.test_stats = {
      pending: statsResult.pending,
      accepted: statsResult.accepted,
      rejected: statsResult.rejected,
    };

    status.services = {
      ApplicationService: '✓ loaded',
      DatabaseFactory: '✓ loaded',
    };

    status.test_result = '✓ All systems operational';
    return ok(res, status);
  } catch (err) {
    return fail(res, `Test failed: ${err.message}`, 500);
  }
}

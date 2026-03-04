import { requireAdmin, cors } from '../_lib/auth.js';
import { ok, fail, denied } from '../_lib/respond.js';
import db from '../_lib/db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Admin-only debug endpoint to check DB connection status
  const auth = requireAdmin(req);
  if (!auth.ok) return denied(res);

  if (req.method === 'GET') {
    try {
      const status = {
        timestamp: new Date().toISOString(),
        supabase_url: process.env.SUPABASE_URL ? '✓ set' : '✗ missing',
        supabase_key: process.env.SUPABASE_SERVICE_KEY ? '✓ set' : '✗ missing',
        firebase_account: process.env.FIREBASE_SERVICE_ACCOUNT ? '✓ set' : '✗ missing',
        use_firebase: process.env.USE_FIREBASE || 'false',
      };

      // Try to fetch one application to test connection
      try {
        const { data, error } = await db.getApplications();
        status.db_query = error ? `✗ ${error.message}` : '✓ success';
        status.app_count = data ? data.length : 0;
      } catch (err) {
        status.db_query = `✗ ${err.message}`;
      }

      return ok(res, status);
    } catch (err) {
      return fail(res, err.message, 500);
    }
  }

  return fail(res, 'Method not allowed.', 405);
}

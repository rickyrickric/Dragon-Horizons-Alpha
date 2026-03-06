import { requireAdmin, cors } from '../lib/auth.js';
import { ok, fail, denied } from '../lib/respond.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  const auth = requireAdmin(req);
  if (!auth.ok) return denied(res);
  if (req.method !== 'GET') return fail(res, 'Only GET allowed', 405);

  try {
    const status = {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV || null,
      }
    };
    return ok(res, status);
  } catch (err) {
    return fail(res, `Status failed: ${err.message}`, 500);
  }
}

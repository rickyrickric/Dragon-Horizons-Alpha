import { requireAdmin, cors } from './_lib/auth.js';
import { ok, fail, denied }  from './_lib/respond.js';
import db from './_lib/db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // GET /api/config
  // - If caller provides the admin secret, return the full config.
  // - Otherwise return a safe public subset (no server address/port).
  if (req.method === 'GET') {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const isAdmin = token && token === process.env.ADMIN_SECRET;

    // Server address/port are public information (not secrets) and should
    // be available to public pages. Include them in the public response.
    const publicKeys = ['drive_link', 'pack_version', 'server_address', 'server_port'];
    const keysToFetch = publicKeys;

    const { data, error } = await db.getConfig();
    if (error) return fail(res, 'Failed to load config.', 500);
    const config = Object.fromEntries((data||[]).map(r => [r.key, r.value]));
    return ok(res, { config, admin: !!isAdmin });
  }

  // PATCH /api/config — admin only, update any config key
  if (req.method === 'PATCH') {
    const auth = requireAdmin(req);
    if (!auth.ok) return denied(res);

    const updates = req.body; // { drive_link: '...', server_address: '...' }
    const allowed = ['drive_link', 'server_address', 'server_port', 'pack_version'];

    for (const [key, value] of Object.entries(updates)) {
      if (!allowed.includes(key)) continue;
      await db.upsertConfig(key, value);
    }

    return ok(res, { message: 'Config updated.' });
  }

  return fail(res, 'Method not allowed.', 405);
}
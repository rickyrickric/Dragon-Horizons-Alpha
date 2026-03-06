import { getServerEntries, getServerEntryById } from '../lib/supabase.js';
import { requireAdmin, cors } from '../lib/auth.js';
import { ok, fail, denied, notFound } from '../lib/respond.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = requireAdmin(req);
  if (!auth.ok) return denied(res);

  if (req.method === 'GET') {
    const id = req.query.id ?? null;
    try {
      if (id) {
        const { data, error } = await getServerEntryById(id);
        if (error) return fail(res, 'Failed to fetch entry.', 500);
        if (!data) return notFound(res);
        return ok(res, { entry: data });
      }

      const limit = Math.min(1000, parseInt(req.query.limit || '100', 10));
      const offset = Math.max(0, parseInt(req.query.offset || '0', 10));
      const { data, error } = await getServerEntries({ limit, offset });
      if (error) return fail(res, 'Failed to fetch entries.', 500);
      return ok(res, { entries: data });
    } catch (err) {
      return fail(res, 'Unexpected error.', 500);
    }
  }

  return fail(res, 'Method not allowed.', 405);
}

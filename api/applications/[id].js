import { requireAdmin, cors } from '../_lib/auth.js';
import { ok, fail, denied, notFound } from '../_lib/respond.js';
import db from '../_lib/db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = requireAdmin(req);
  if (!auth.ok) return denied(res);

  const { id } = req.query;

  // GET /api/applications/:id
  if (req.method === 'GET') {
    const { data, error } = await db.getApplicationById(id);
    if (error || !data) return notFound(res);
    return ok(res, { application: data });
  }

  // PATCH /api/applications/:id — update status + optional admin note
  if (req.method === 'PATCH') {
    const { status, admin_note } = req.body;
    if (!['pending','accepted','rejected'].includes(status)) {
      return fail(res, 'Invalid status. Must be pending, accepted, or rejected.');
    }

    const { data, error } = await db.updateApplication(id, { status, admin_note: admin_note ?? null, reviewed_at: new Date().toISOString() });
    if (error || !data) return notFound(res);
    return ok(res, { application: data });
  }

  // DELETE /api/applications/:id
  if (req.method === 'DELETE') {
    const { error } = await db.deleteApplication(id);
    if (error) return fail(res, 'Failed to delete application.', 500);
    return ok(res, { message: 'Application deleted.' });
  }

  return fail(res, 'Method not allowed.', 405);
}
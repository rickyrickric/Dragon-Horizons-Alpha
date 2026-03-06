import { requireAdmin, cors, parseBody } from '../../../lib/auth.js';
import { ok, fail, denied, notFound } from '../../../lib/respond.js';
import { databaseFactory } from '../../../lib/factory/DatabaseFactory.js';
import { ApplicationService } from '../../../lib/services/ApplicationService.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = requireAdmin(req);
  if (!auth.ok) return denied(res);

  const { id } = req.query;
  const appRepo = databaseFactory.getApplicationRepository();
  const appService = new ApplicationService(appRepo);

  if (req.method === 'GET') {
    const result = await appService.getApplication(id);
    if (!result.success) return notFound(res);
    return ok(res, { application: result.data });
  }

  if (req.method === 'PATCH') {
    const body = parseBody(req);
    const result = await appService.updateApplicationStatus(id, body.status, body.admin_note);
    if (!result.success) return fail(res, result.error, 500);
    return ok(res, { application: result.data });
  }

  if (req.method === 'DELETE') {
    const result = await appService.deleteApplication(id);
    if (!result.success) return fail(res, result.error, 500);
    return ok(res, { message: 'Application deleted.' });
  }

  return fail(res, 'Method not allowed.', 405);
}

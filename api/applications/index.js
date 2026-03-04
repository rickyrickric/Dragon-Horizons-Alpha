import { requireAdmin, cors, parseBody } from '../_lib/auth.js';
import { ok, fail, denied } from '../_lib/respond.js';
import { validateApplication } from '../_lib/validate.js';
import { databaseFactory } from '../_lib/factory/DatabaseFactory.js';
import { ApplicationService } from '../_lib/services/ApplicationService.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Create service
  const appRepo = databaseFactory.getApplicationRepository();
  const appService = new ApplicationService(appRepo);

  // POST /api/applications — submit new application (public)
  if (req.method === 'POST') {
    const body = parseBody(req);
    const errors = validateApplication(body);
    if (errors.length) return fail(res, errors.join(' '));

    const result = await appService.submitApplication(body);
    
    if (!result.success) return fail(res, result.error, 409);
    return ok(res, { message: 'Application submitted!', id: result.data.id }, 201);
  }

  // GET /api/applications — list all (admin only)
  if (req.method === 'GET') {
    const auth = requireAdmin(req);
    if (!auth.ok) return denied(res);

    const status = req.query.status; // optional filter
    const result = await appService.getApplications(status);
    
    if (!result.success) return fail(res, result.error, 500);
    return ok(res, { applications: result.data });
  }

  return fail(res, 'Method not allowed.', 405);
}
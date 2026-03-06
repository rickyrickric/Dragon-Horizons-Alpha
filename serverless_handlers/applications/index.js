export default async function handler(req, res) {
  const baseUrl = new URL(import.meta.url);
  const libUrl = new URL('../../lib/', baseUrl).href;
  
  const { requireAdmin, cors, parseBody } = await import(new URL('auth.js', libUrl).href);
  const { ok, fail, denied } = await import(new URL('respond.js', libUrl).href);
  const { validateApplication } = await import(new URL('validate.js', libUrl).href);
  const { databaseFactory } = await import(new URL('factory/DatabaseFactory.js', libUrl).href);
  const { ApplicationService } = await import(new URL('services/ApplicationService.js', libUrl).href);
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const appRepo = databaseFactory.getApplicationRepository();
  const appService = new ApplicationService(appRepo);

  if (req.method === 'POST') {
    const body = parseBody(req);
    const errors = validateApplication(body);
    if (errors.length) return fail(res, errors.join(' '));

    const result = await appService.submitApplication(body);
    if (!result.success) return fail(res, result.error, 409);
    return ok(res, { message: 'Application submitted!', id: result.data.id }, 201);
  }

  if (req.method === 'GET') {
    const auth = requireAdmin(req);
    if (!auth.ok) return denied(res);

    const status = req.query.status;
    const result = await appService.getApplications(status);
    if (!result.success) return fail(res, result.error, 500);
    return ok(res, { applications: result.data });
  }

  return fail(res, 'Method not allowed.', 405);
}

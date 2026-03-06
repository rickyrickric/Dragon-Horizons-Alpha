export default async function handler(req, res) {
  const baseUrl = new URL(import.meta.url);
  const libUrl = new URL('../../lib/', baseUrl).href;
  
  const { requireAdmin, cors, parseBody } = await import(new URL('auth.js', libUrl).href);
  const { ok, fail, denied } = await import(new URL('respond.js', libUrl).href);
  const { databaseFactory } = await import(new URL('factory/DatabaseFactory.js', libUrl).href);
  const { ConfigService } = await import(new URL('services/ConfigService.js', libUrl).href);

  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const configRepo = databaseFactory.getConfigRepository();
  const configService = new ConfigService(configRepo);

  if (req.method === 'GET') {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const isAdmin = token && token === process.env.ADMIN_SECRET;

    const result = isAdmin
      ? await configService.getAllConfig()
      : await configService.getPublicConfig();

    if (!result.success) return fail(res, result.error, 500);
    return ok(res, { config: result.data, admin: isAdmin });
  }

  if (req.method === 'PATCH') {
    const auth = requireAdmin(req);
    if (!auth.ok) return denied(res);

    const body = parseBody(req);
    const result = await configService.updateConfig(body);

    if (!result.success) return fail(res, result.error, 500);
    return ok(res, { message: 'Config updated.', data: result.data });
  }

  return fail(res, 'Method not allowed.', 405);
}

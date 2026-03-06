import { requireAdmin, cors, parseBody } from '../../lib/auth.js';
import { ok, fail, denied } from '../../lib/respond.js';
import { databaseFactory } from '../../lib/factory/DatabaseFactory.js';
import { ConfigService } from '../../lib/services/ConfigService.js';

export default async function handler(req, res) {
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

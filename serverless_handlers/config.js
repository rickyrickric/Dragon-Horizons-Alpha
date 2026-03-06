import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const libDir = resolve(__dirname, '../lib');
const { requireAdmin, cors, parseBody } = await import(`file://${resolve(libDir, 'auth.js')}`);
const { ok, fail, denied } = await import(`file://${resolve(libDir, 'respond.js')}`);
const { databaseFactory } = await import(`file://${resolve(libDir, 'factory/DatabaseFactory.js')}`);
const { ConfigService } = await import(`file://${resolve(libDir, 'services/ConfigService.js')}`);

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

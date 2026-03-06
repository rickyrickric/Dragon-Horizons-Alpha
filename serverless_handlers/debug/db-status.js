import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const libDir = resolve(__dirname, '../../lib');
const { requireAdmin, cors } = await import(`file://${resolve(libDir, 'auth.js')}`);
const { ok, fail, denied } = await import(`file://${resolve(libDir, 'respond.js')}`);

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

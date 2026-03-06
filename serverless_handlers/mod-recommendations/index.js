import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const libDir = resolve(__dirname, '../../lib');
const { requireAdmin, cors, parseBody } = await import(`file://${resolve(libDir, 'auth.js')}`);
const { ok, fail, denied } = await import(`file://${resolve(libDir, 'respond.js')}`);
const { databaseFactory } = await import(`file://${resolve(libDir, 'factory/DatabaseFactory.js')}`);
const { ModRecommendationService } = await import(`file://${resolve(libDir, 'services/ModRecommendationService.js')}`);

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const modRecRepo = databaseFactory.getModRecommendationRepository();
    const modRecService = new ModRecommendationService(modRecRepo);

    if (req.method === 'POST') {
      const body = parseBody(req);
      const errors = [];
      if (!body.submitter_name?.trim()) errors.push('Submitter name is required.');
      if (!body.submitter_discord?.trim()) errors.push('Discord tag is required.');
      if (!body.mod_name?.trim()) errors.push('Mod name is required.');
      if (!body.mod_link?.trim()) errors.push('Mod link is required.');
      if (errors.length > 0) return fail(res, errors.join(' '));

      const result = await modRecService.submitRecommendation(body);
      if (!result.success) return fail(res, result.error, 400);
      return ok(res, { message: 'Mod recommendation submitted!', id: result.data.id }, 201);
    }

    if (req.method === 'GET') {
      const auth = requireAdmin(req);
      if (!auth.ok) return denied(res);

      const status = req.query.status;
      const result = await modRecService.getRecommendations(status);
      if (!result.success) return fail(res, result.error, 500);
      return ok(res, { recommendations: result.data, count: result.data.length });
    }

    if (req.method === 'PATCH' || req.method === 'DELETE') {
      return fail(res, 'Use /api/mod-recommendations/[id] for individual operations.', 400);
    }

    return fail(res, 'Method not allowed.', 405);
  } catch (err) {
    console.error('❌ [/api/mod-recommendations] Unhandled error:', { method: req.method, error: err.message, stack: err.stack });
    return fail(res, 'Internal server error. Please check server logs.', 500);
  }
}

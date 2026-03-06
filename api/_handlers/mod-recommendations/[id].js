export default async function handler(req, res) {
  const baseUrl = new URL(import.meta.url);
  const libUrl = new URL('../../../lib/', baseUrl).href;
  
  const { requireAdmin, cors, parseBody } = await import(new URL('auth.js', libUrl).href);
  const { ok, fail, denied } = await import(new URL('respond.js', libUrl).href);
  const { databaseFactory } = await import(new URL('factory/DatabaseFactory.js', libUrl).href);
  const { ModRecommendationService } = await import(new URL('services/ModRecommendationService.js', libUrl).href);
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { id } = req.query;
    if (!id) return fail(res, 'Recommendation ID is required.', 400);

    const modRecRepo = databaseFactory.getModRecommendationRepository();
    const modRecService = new ModRecommendationService(modRecRepo);

    if (req.method === 'GET') {
      const auth = requireAdmin(req);
      if (!auth.ok) return denied(res);
      const result = await modRecService.getRecommendation(id);
      if (!result.success) return fail(res, result.error, 404);
      return ok(res, { recommendation: result.data });
    }

    if (req.method === 'PATCH') {
      const auth = requireAdmin(req);
      if (!auth.ok) return denied(res);
      const body = parseBody(req);
      const { status, admin_comment } = body;
      if (!status) return fail(res, 'Status is required.', 400);
      if (!['pending', 'approved', 'denied'].includes(status)) return fail(res, 'Invalid status. Must be pending, approved, or denied.', 400);
      const result = await modRecService.updateRecommendationStatus(id, status, admin_comment);
      if (!result.success) return fail(res, result.error, 400);
      return ok(res, { message: `Recommendation marked as ${status}.`, recommendation: result.data });
    }

    if (req.method === 'DELETE') {
      const auth = requireAdmin(req);
      if (!auth.ok) return denied(res);
      const result = await modRecService.deleteRecommendation(id);
      if (!result.success) return fail(res, result.error, 400);
      return ok(res, { message: 'Recommendation deleted.' });
    }

    return fail(res, 'Method not allowed.', 405);
  } catch (err) {
    console.error('❌ [/api/mod-recommendations/[id]] Unhandled error:', { id: req.query.id, method: req.method, error: err.message, stack: err.stack });
    return fail(res, 'Internal server error. Please check server logs.', 500);
  }
}

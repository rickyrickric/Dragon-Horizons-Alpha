/**
 * Individual Mod Recommendation API Endpoint
 * 
 * Handles operations on single mod recommendations:
 * - GET: View single recommendation details
 * - PATCH: Update status and admin comment (admin only)
 * - DELETE: Remove recommendation (admin only)
 */

import { requireAdmin, cors, parseBody } from '../../_lib/auth.js';
import { ok, fail, denied } from '../../_lib/respond.js';
import { databaseFactory } from '../../_lib/factory/DatabaseFactory.js';
import { ModRecommendationService } from '../../_lib/services/ModRecommendationService.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { id } = req.query;
  if (!id) return fail(res, 'Recommendation ID required.', 400);

  const modRecRepo = databaseFactory.getModRecommendationRepository();
  const modRecService = new ModRecommendationService(modRecRepo);

  // GET /api/mod-recommendations/:id — view single recommendation
  if (req.method === 'GET') {
    const result = await modRecService.getRecommendation(id);
    
    if (!result.success) {
      return fail(res, result.error, 404);
    }

    return ok(res, { recommendation: result.data });
  }

  // PATCH /api/mod-recommendations/:id — update status (admin only)
  if (req.method === 'PATCH') {
    const auth = requireAdmin(req);
    if (!auth.ok) return denied(res);

    const body = parseBody(req);
    const { status, admin_comment } = body;

    if (!status) {
      return fail(res, 'Status is required.', 400);
    }

    const result = await modRecService.updateRecommendationStatus(id, status, admin_comment);
    
    if (!result.success) {
      return fail(res, result.error, 400);
    }

    return ok(res, { 
      message: `Recommendation marked as "${status}".`,
      recommendation: result.data 
    });
  }

  // DELETE /api/mod-recommendations/:id — delete recommendation (admin only)
  if (req.method === 'DELETE') {
    const auth = requireAdmin(req);
    if (!auth.ok) return denied(res);

    const result = await modRecService.deleteRecommendation(id);
    
    if (!result.success) {
      return fail(res, result.error, 400);
    }

    return ok(res, { message: 'Recommendation deleted.' });
  }

  return fail(res, 'Method not allowed.', 405);
}

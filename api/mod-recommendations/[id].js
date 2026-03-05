/**
 * Individual Mod Recommendation Endpoint
 * 
 * Handles specific mod recommendation operations:
 * - GET: Retrieve single recommendation (admin only)
 * - PATCH: Update recommendation status (admin only)
 * - DELETE: Remove recommendation (admin only)
 */

import { requireAdmin, cors, parseBody } from '../_lib/auth.js';
import { ok, fail, denied } from '../_lib/respond.js';
import { databaseFactory } from '../_lib/factory/DatabaseFactory.js';
import { ModRecommendationService } from '../_lib/services/ModRecommendationService.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { id } = req.query;
  if (!id) return fail(res, 'Recommendation ID is required.', 400);

  // Create service
  const modRecRepo = databaseFactory.getModRecommendationRepository();
  const modRecService = new ModRecommendationService(modRecRepo);

  // GET /api/mod-recommendations/[id] — get single recommendation (admin only)
  if (req.method === 'GET') {
    const auth = requireAdmin(req);
    if (!auth.ok) return denied(res);

    const result = await modRecService.getRecommendation(id);
    if (!result.success) {
      return fail(res, result.error, 404);
    }

    return ok(res, { recommendation: result.data });
  }

  // PATCH /api/mod-recommendations/[id] — update status (admin only)
  if (req.method === 'PATCH') {
    const auth = requireAdmin(req);
    if (!auth.ok) return denied(res);

    const body = parseBody(req);
    const { status, admin_comment } = body;

    // Validate status
    if (!status) return fail(res, 'Status is required.', 400);
    if (!['pending', 'approved', 'denied'].includes(status)) {
      return fail(res, 'Invalid status. Must be pending, approved, or denied.', 400);
    }

    const result = await modRecService.updateRecommendationStatus(id, status, admin_comment);
    if (!result.success) {
      return fail(res, result.error, 400);
    }

    return ok(res, { 
      message: `Recommendation marked as ${status}.`,
      recommendation: result.data 
    });
  }

  // DELETE /api/mod-recommendations/[id] — delete recommendation (admin only)
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

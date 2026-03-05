/**
 * Individual Event Endpoint
 * 
 * Handles specific event operations:
 * - GET: Retrieve single event (public)
 * - PATCH: Update event (admin only)
 * - DELETE: Remove event (admin only)
 */

import { requireAdmin, cors, parseBody } from '../_lib/auth.js';
import { ok, fail, denied } from '../_lib/respond.js';
import { databaseFactory } from '../_lib/factory/DatabaseFactory.js';
import { EventService } from '../_lib/services/EventService.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { id } = req.query;
    if (!id) return fail(res, 'Event ID is required', 400);

    const eventRepo = databaseFactory.getEventRepository();
    const eventService = new EventService(eventRepo);

    // GET /api/events/[id] — get single event (public)
    if (req.method === 'GET') {
      const { data: events } = await eventRepo.getActive();
      const event = events?.find(e => e.id === id);
      
      if (!event) {
        return fail(res, 'Event not found', 404);
      }

      return ok(res, { event });
    }

    // PATCH /api/events/[id] — update event (admin only)
    if (req.method === 'PATCH') {
      const auth = requireAdmin(req);
      if (!auth.ok) return denied(res);

      const body = parseBody(req);
      const result = await eventService.updateEvent(id, body);

      if (!result.success) {
        return fail(res, result.error, 400);
      }

      return ok(res, { 
        message: 'Event updated successfully',
        event: result.data
      });
    }

    // DELETE /api/events/[id] — delete event (admin only)
    if (req.method === 'DELETE') {
      const auth = requireAdmin(req);
      if (!auth.ok) return denied(res);

      const result = await eventService.deleteEvent(id);

      if (!result.success) {
        return fail(res, result.error, 400);
      }

      return ok(res, { message: 'Event deleted successfully' });
    }

    return fail(res, 'Method not allowed', 405);
  } catch (err) {
    console.error('❌ [/api/events/[id]] Unhandled error:', {
      id: req.query.id,
      method: req.method,
      error: err.message,
      stack: err.stack
    });
    return fail(res, 'Internal server error. Please check server logs.', 500);
  }
}

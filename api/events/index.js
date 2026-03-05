/**
 * Events API Endpoint
 * 
 * Handles countdown timer events:
 * - GET: List all active events (public)
 * - POST: Create new event (admin only)
 */

import { requireAdmin, cors, parseBody } from '../_lib/auth.js';
import { ok, fail, denied } from '../_lib/respond.js';
import { databaseFactory } from '../_lib/factory/DatabaseFactory.js';
import { EventService } from '../_lib/services/EventService.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const eventRepo = databaseFactory.getEventRepository();
    const eventService = new EventService(eventRepo);

    // GET /api/events — list all active events (public)
    if (req.method === 'GET') {
      const result = await eventService.getActiveEvents();
      
      if (!result.success) {
        return fail(res, result.error, 500);
      }

      return ok(res, { 
        events: result.data,
        count: result.data?.length || 0
      });
    }

    // POST /api/events — create new event (admin only)
    if (req.method === 'POST') {
      const auth = requireAdmin(req);
      if (!auth.ok) return denied(res);

      const body = parseBody(req);
      
      // Validate required fields
      if (!body.event_type?.trim()) {
        return fail(res, 'Event type is required', 400);
      }
      if (!body.description?.trim()) {
        return fail(res, 'Description is required', 400);
      }
      if (!body.event_time) {
        return fail(res, 'Event time is required', 400);
      }

      const result = await eventService.createEvent(body);
      
      if (!result.success) {
        return fail(res, result.error, 400);
      }

      return ok(res, { 
        message: 'Event created successfully',
        event: result.data
      }, 201);
    }

    return fail(res, 'Method not allowed', 405);
  } catch (err) {
    console.error('❌ [/api/events] Unhandled error:', {
      method: req.method,
      error: err.message,
      stack: err.stack
    });
    return fail(res, 'Internal server error. Please check server logs.', 500);
  }
}

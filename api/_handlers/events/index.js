import { requireAdmin, cors, parseBody } from '../../../lib/auth.js';
import { ok, fail, denied } from '../../../lib/respond.js';
import { databaseFactory } from '../../../lib/factory/DatabaseFactory.js';
import { EventService } from '../../../lib/services/EventService.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const eventRepo = databaseFactory.getEventRepository();
    const eventService = new EventService(eventRepo);

    if (req.method === 'GET') {
      const result = await eventService.getActiveEvents();
      if (!result.success) return fail(res, result.error, 500);
      return ok(res, { 
        events: result.data,
        count: result.data?.length || 0
      });
    }

    if (req.method === 'POST') {
      const auth = requireAdmin(req);
      if (!auth.ok) return denied(res);

      const body = parseBody(req);
      if (!body.event_type?.trim()) return fail(res, 'Event type is required', 400);
      if (!body.description?.trim()) return fail(res, 'Description is required', 400);
      if (!body.event_time) return fail(res, 'Event time is required', 400);

      const result = await eventService.createEvent(body);
      if (!result.success) return fail(res, result.error, 400);
      return ok(res, { message: 'Event created successfully', event: result.data }, 201);
    }

    return fail(res, 'Method not allowed', 405);
  } catch (err) {
    console.error('❌ [/api/events] Unhandled error:', {
      method: req.method,
      error: err.message,
      stack: err.stack
    });
    return fail(res, `Internal server error: ${err.message}`, 500);
  }
}

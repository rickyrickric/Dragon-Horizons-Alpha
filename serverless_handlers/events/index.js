export default async function handler(req, res) {
  const baseUrl = new URL(import.meta.url);
  const libUrl = new URL('../../lib/', baseUrl).href;
  
  const { requireAdmin, cors, parseBody } = await import(new URL('auth.js', libUrl).href);
  const { ok, fail, denied } = await import(new URL('respond.js', libUrl).href);
  const { databaseFactory } = await import(new URL('factory/DatabaseFactory.js', libUrl).href);
  const { EventService } = await import(new URL('services/EventService.js', libUrl).href);
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
    return fail(res, 'Internal server error. Please check server logs.', 500);
  }
}

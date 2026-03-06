import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const libDir = resolve(__dirname, '../../lib');
const { requireAdmin, cors, parseBody } = await import(`file://${resolve(libDir, 'auth.js')}`);
const { ok, fail, denied, notFound } = await import(`file://${resolve(libDir, 'respond.js')}`);
const { databaseFactory } = await import(`file://${resolve(libDir, 'factory/DatabaseFactory.js')}`);
const { EventService } = await import(`file://${resolve(libDir, 'services/EventService.js')}`);

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const { id } = req.query;
    const eventRepo = databaseFactory.getEventRepository();
    const eventService = new EventService(eventRepo);

    if (req.method === 'GET') {
      if (!id) return notFound(res);
      const result = await eventService.getEventById(id);
      if (!result.success) return notFound(res);
      return ok(res, { event: result.data });
    }

    if (req.method === 'PATCH') {
      const auth = requireAdmin(req);
      if (!auth.ok) return denied(res);

      const body = parseBody(req);
      const result = await eventService.updateEvent(id, body);
      if (!result.success) return fail(res, result.error, 400);
      return ok(res, { message: 'Event updated', event: result.data });
    }

    if (req.method === 'DELETE') {
      const auth = requireAdmin(req);
      if (!auth.ok) return denied(res);

      const result = await eventService.deleteEvent(id);
      if (!result.success) return fail(res, result.error, 400);
      return ok(res, { message: 'Event deleted' });
    }

    return fail(res, 'Method not allowed', 405);
  } catch (err) {
    console.error('❌ [/api/events/[id]] Unhandled error:', { id: req.query.id, method: req.method, error: err.message, stack: err.stack });
    return fail(res, 'Internal server error. Please check server logs.', 500);
  }
}

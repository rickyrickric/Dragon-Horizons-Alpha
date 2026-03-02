import supabase        from './_lib/supabase.js';
import { requireAdmin, cors } from './_lib/auth.js';
import { ok, fail, denied }  from './_lib/respond.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // GET /api/config — public, returns drive link + server address
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('site_config')
      .select('key, value')
      .in('key', ['drive_link', 'server_address', 'server_port', 'pack_version']);

    if (error) return fail(res, 'Failed to load config.', 500);

    const config = Object.fromEntries(data.map(r => [r.key, r.value]));
    return ok(res, { config });
  }

  // PATCH /api/config — admin only, update any config key
  if (req.method === 'PATCH') {
    const auth = requireAdmin(req);
    if (!auth.ok) return denied(res);

    const updates = req.body; // { drive_link: '...', server_address: '...' }
    const allowed = ['drive_link', 'server_address', 'server_port', 'pack_version'];

    for (const [key, value] of Object.entries(updates)) {
      if (!allowed.includes(key)) continue;
      await supabase
        .from('site_config')
        .upsert({ key, value }, { onConflict: 'key' });
    }

    return ok(res, { message: 'Config updated.' });
  }

  return fail(res, 'Method not allowed.', 405);
}
export default async function handler(req, res) {
  const baseUrl = new URL(import.meta.url);
  const libUrl = new URL('../lib/', baseUrl).href;
  
  const supabaseModule = await import(new URL('supabase.js', libUrl).href);
  const supabase = supabaseModule.default;
  const { ok, fail } = await import(new URL('respond.js', libUrl).href);
  const { cors } = await import(new URL('auth.js', libUrl).href);
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return fail(res, 'Method not allowed.', 405);

  const username = req.query.username?.trim().toLowerCase();
  if (!username) return fail(res, 'username query param is required.');

  const { data, error } = await supabase
    .from('applications')
    .select('status, admin_note, reviewed_at, nickname')
    .eq('aternos_username', username)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error)  return fail(res, 'Lookup failed.', 500);
  if (!data)  return ok(res, { found: false, status: null });

  return ok(res, {
    found:       true,
    status:      data.status,
    admin_note:  data.status !== 'pending' ? (data.admin_note ?? null) : null,
    reviewed_at: data.status !== 'pending' ? data.reviewed_at : null,
    nickname:    data.nickname,
  });
}

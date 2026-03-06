export default async function handler(req, res) {
  try {
    const baseUrl = new URL(import.meta.url);
    const handlersUrl = new URL('./_handlers/', baseUrl).href;

    const host = req.headers.host || 'localhost';
    const url = new URL(req.url, `http://${host}`);
    let pathname = url.pathname || '/';
    // strip leading /api
    pathname = pathname.replace(/^\/api/, '') || '/';
    const segments = pathname.split('/').filter(Boolean);

    // populate req.query from search params
    req.query = req.query || {};
    for (const [k, v] of url.searchParams.entries()) req.query[k] = v;

    const first = segments[0] || '';

    // helper to dynamically import a handler and call it
    async function delegate(handlerPath) {
      try {
        const handlerUrl = new URL(handlerPath, handlersUrl).href;
        const mod = await import(handlerUrl);
        if (!mod || !mod.default) return res.status(500).end('Handler not found');
        return await mod.default(req, res);
      } catch (importErr) {
        console.error('Delegate import error:', { path: handlerPath, error: importErr.message, stack: importErr.stack });
        return res.status(500).end(`Handler import failed: ${importErr.message}`);
      }
    }

    // Route mapping
    if (!first) return res.status(404).end('Not found');

    // id-based resources
    if (['applications', 'events', 'mod-recommendations'].includes(first)) {
      if (segments[1]) req.query.id = segments[1];
      if (segments[1]) {
        // delegate to the [id] handler
        return delegate(`${first}/[id].js`);
      }
      return delegate(`${first}/index.js`);
    }

    // debug routes
    if (first === 'debug') {
      if (!segments[1]) return res.status(404).end('Not found');
      const debugMap = {
        'test-db': 'debug/test-db.js',
        'db-status': 'debug/db-status.js'
      };
      const target = debugMap[segments[1]];
      if (!target) return res.status(404).end('Not found');
      return delegate(target);
    }

    // single-file routes
    const singleMap = {
      enter: 'enter.js',
      config: 'config.js',
      server_entries: 'server_entries.js',
      status: 'status.js',
      'status-check': 'status-check.js',
      // other single routes can be added here
    };

    const target = singleMap[first];
    if (!target) return res.status(404).end('Not found');
    return delegate(target);
  } catch (err) {
    console.error('Router error:', err);
    return res.status(500).end('Internal server error');
  }
}

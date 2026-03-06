// Static imports of all handlers
import configHandler from './_handlers/config.js';
import enterHandler from './_handlers/enter.js';
import serverEntriesHandler from './_handlers/server_entries.js';
import statusHandler from './_handlers/status.js';
import statusCheckHandler from './_handlers/status-check.js';

import applicationsIndexHandler from './_handlers/applications/index.js';
import applicationsIdHandler from './_handlers/applications/[id].js';

import eventsIndexHandler from './_handlers/events/index.js';
import eventsIdHandler from './_handlers/events/[id].js';

import modRecommendationsIndexHandler from './_handlers/mod-recommendations/index.js';
import modRecommendationsIdHandler from './_handlers/mod-recommendations/[id].js';

import debugDbStatusHandler from './_handlers/debug/db-status.js';
import debugTestDbHandler from './_handlers/debug/test-db.js';

export default async function handler(req, res) {
  try {
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
    const second = segments[1];

    if (!first) return res.status(404).end('Not found');

    // Route to appropriate handler based on path
    try {
      // Handle id-based resources
      if (first === 'applications') {
        if (second) {
          req.query.id = second;
          return await applicationsIdHandler(req, res);
        }
        return await applicationsIndexHandler(req, res);
      }

      if (first === 'events') {
        if (second) {
          req.query.id = second;
          return await eventsIdHandler(req, res);
        }
        return await eventsIndexHandler(req, res);
      }

      if (first === 'mod-recommendations') {
        if (second) {
          req.query.id = second;
          return await modRecommendationsIdHandler(req, res);
        }
        return await modRecommendationsIndexHandler(req, res);
      }

      // Debug routes
      if (first === 'debug') {
        if (second === 'test-db') return await debugTestDbHandler(req, res);
        if (second === 'db-status') return await debugDbStatusHandler(req, res);
        return res.status(404).end('Not found');
      }

      // Single-file routes
      if (first === 'config') return await configHandler(req, res);
      if (first === 'enter') return await enterHandler(req, res);
      if (first === 'server_entries') return await serverEntriesHandler(req, res);
      if (first === 'status') return await statusHandler(req, res);
      if (first === 'status-check') return await statusCheckHandler(req, res);

      // If no route matched
      return res.status(404).end('Not found');
    } catch (err) {
      console.error('Handler execution error:', { path: pathname, error: err.message, stack: err.stack });
      return res.status(500).end(`Handler error: ${err.message}`);
    }
  } catch (err) {
    console.error('Router error:', err);
    return res.status(500).end('Internal server error');
  }
}

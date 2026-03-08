export function requireAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || token !== process.env.ADMIN_SECRET) {
    return { ok: false, error: 'Unauthorized' };
  }
  return { ok: true };
}

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function parseBody(req) {
  // If already parsed (Vercel might pre-parse), return as-is
  if (typeof req.body === 'object' && req.body !== null) {
    return req.body;
  }
  
  // If it's a string, attempt to parse
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch (e) {
      console.error('Failed to parse body string:', e);
      return {};
    }
  }
  
  // Fallback for empty or undefined body
  return {};
}

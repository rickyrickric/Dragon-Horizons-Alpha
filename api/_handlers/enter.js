function validateEntry(body) {
  const errors = [];
  const nickname = body.nickname ? String(body.nickname).trim() : '';
  const discord = body.discord ? String(body.discord).trim() : '';
  const aternos = body.aternos_username ?? body.aternos ?? '';
  const aternosNorm = aternos ? String(aternos).trim().toLowerCase() : '';

  if (!nickname && !aternosNorm) {
    errors.push('At least a nickname or an Aternos username is required.');
  }
  if (nickname && nickname.length > 100) errors.push('Nickname too long (max 100 chars).');
  if (discord && discord.length > 100) errors.push('Discord tag too long (max 100 chars).');
  if (aternosNorm && aternosNorm.length > 100) errors.push('Aternos username too long (max 100 chars).');

  return { errors, sanitized: { nickname, discord, aternos_username: aternosNorm } };
}

import { recordServerEntry } from '../../lib/supabase.js';
import { ok, fail } from '../../lib/respond.js';
import { cors, parseBody } from '../../lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return fail(res, 'Method not allowed.', 405);

  const body = parseBody(req) || {};
  const { errors, sanitized } = validateEntry(body);
  if (errors.length) return fail(res, errors.join(' '), 422);

  const source = body.source ?? req.headers.referer ?? null;
  const ip = (req.headers['x-forwarded-for'] || '').split(',').shift()?.trim() || req.socket?.remoteAddress || null;
  const user_agent = req.headers['user-agent'] || null;

  const entry = {
    nickname: sanitized.nickname || null,
    discord: sanitized.discord || null,
    aternos_username: sanitized.aternos_username || null,
    ip,
    user_agent,
    source,
  };

  try {
    const { data, error } = await recordServerEntry(entry);
    if (error) return fail(res, 'Failed to record server entry.', 500);
    const insertedId = (data && (data.id || (Array.isArray(data) && data[0]?.id))) || null;
    return ok(res, { message: 'Entry recorded.', id: insertedId }, 201);
  } catch (err) {
    return fail(res, 'Unexpected error.', 500);
  }
}

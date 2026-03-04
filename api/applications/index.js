import { requireAdmin, cors, parseBody } from '../_lib/auth.js';
import { ok, fail, denied }  from '../_lib/respond.js';
import { validateApplication } from '../_lib/validate.js';
import db from '../_lib/db.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // POST /api/applications — submit new application (public)
  if (req.method === 'POST') {
    const body = parseBody(req);
    const errors = validateApplication(body);
    if (errors.length) return fail(res, errors.join(' '));

    const { nickname, discord, aternos_username, reason } = body;

    // Block duplicate pending/accepted aternos usernames
    const existing = await db.findExistingApplication(aternos_username.trim().toLowerCase());
    if (existing) {
      const msg = existing.status === 'accepted'
        ? 'This Aternos username already has access.'
        : 'An application for this Aternos username is already pending review.';
      return fail(res, msg, 409);
    }
    const payload = {
      nickname:        nickname.trim(),
      discord:         discord.trim(),
      aternos_username: aternos_username.trim().toLowerCase(),
      reason:          reason.trim(),
      status:          'pending',
    };

    const { data, error } = await db.insertApplication(payload);
    if (error) return fail(res, 'Failed to submit application. Please try again.', 500);
    return ok(res, { message: 'Application submitted!', id: data.id }, 201);
  }

  // GET /api/applications — list all (admin only)
  if (req.method === 'GET') {
    const auth = requireAdmin(req);
    if (!auth.ok) return denied(res);

    const status = req.query.status; // optional filter
    const { data, error } = await db.getApplications(status);
    if (error) return fail(res, 'Failed to fetch applications.', 500);
    return ok(res, { applications: data });
  }

  return fail(res, 'Method not allowed.', 405);
}
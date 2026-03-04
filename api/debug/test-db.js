// Debug endpoint to test Supabase connection
// Accessible at: /api/debug/test-db
// Returns env var status and a test insert attempt

import { cors } from '../_lib/auth.js';
import { ok, fail } from '../_lib/respond.js';
import db from '../_lib/db.js';

export default async function handler(req, res) {
  cors(res);

  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_SERVICE_KEY;
  const useFirebase = process.env.USE_FIREBASE === '1' || process.env.USE_FIREBASE === 'true';

  const status = {
    env_vars: {
      SUPABASE_URL: hasUrl ? '✓ set' : '✗ missing',
      SUPABASE_SERVICE_KEY: hasKey ? '✓ set' : '✗ missing',
      USE_FIREBASE: useFirebase ? 'true (Firestore)' : 'false (Supabase)',
      FIREBASE_SERVICE_ACCOUNT: !!process.env.FIREBASE_SERVICE_ACCOUNT ? '✓ set' : '✗ missing',
      ADMIN_SECRET: !!process.env.ADMIN_SECRET ? '✓ set' : '✗ missing',
    },
    backend: useFirebase ? 'Firestore' : 'Supabase',
    deployment: process.env.VERCEL_URL ? `Vercel: ${process.env.VERCEL_URL}` : 'Local/Unknown',
  };

  if (!hasUrl || !hasKey) {
    return ok(res, {
      message: 'Supabase connection cannot be established — missing env vars.',
      ...status,
      fix: 'Set SUPABASE_URL and SUPABASE_SERVICE_KEY in Vercel Project Settings → Environment Variables',
    });
  }

  // Try a test query
  try {
    const testPayload = {
      nickname: 'DebugTest',
      discord: 'Debug#0001',
      aternos_username: `debug_test_${Date.now()}`,
      reason: 'Debug endpoint test insertion. This is long enough.',
      status: 'pending',
    };
    const { data, error } = await db.insertApplication(testPayload);
    
    if (error) {
      return ok(res, {
        message: 'Test insert failed.',
        ...status,
        test_insert_error: error,
      });
    }

    // Cleanup by deleting the test row
    await db.deleteApplication(data.id);

    return ok(res, {
      message: 'Connection test successful!',
      ...status,
      test_insert: { success: true, inserted_id: data.id, cleaned_up: true },
    });
  } catch (err) {
    return ok(res, {
      message: 'Test insert threw an error.',
      ...status,
      error: err.message,
    });
  }
}

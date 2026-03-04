// Deletes test application rows inserted during local tests.
// Usage (PowerShell):
// $env:SUPABASE_URL='https://...'
// $env:SUPABASE_SERVICE_KEY='your_service_role'
// node scripts/cleanup_test_applications.js

(async () => {
  try {
    const path = require('path');
    const { pathToFileURL } = require('url');
    const dbPath = pathToFileURL(path.resolve(__dirname, '..', 'api', '_lib', 'db.js')).href;
    const mod = await import(dbPath);
    const db = mod.default || mod;

    console.log('Fetching applications...');
    const { data: apps, error } = await db.getApplications();
    if (error) {
      console.error('Failed to fetch applications:', error);
      process.exit(2);
    }

    const candidates = (apps || []).filter(a => typeof a.aternos_username === 'string' && /^autotest_/.test(a.aternos_username));
    if (!candidates.length) {
      console.log('No test applications found.');
      process.exit(0);
    }

    console.log(`Found ${candidates.length} test application(s). Deleting...`);
    for (const app of candidates) {
      try {
        await db.deleteApplication(app.id);
        console.log('Deleted:', app.id, app.aternos_username);
      } catch (e) {
        console.error('Failed to delete', app.id, e);
      }
    }

    console.log('Cleanup complete.');
    process.exit(0);
  } catch (err) {
    console.error('Cleanup script failed:', err);
    process.exit(99);
  }
})();

// Run this in PowerShell after setting FIREBASE_SERVICE_ACCOUNT env var.
// It dynamically imports the `db` abstraction and inserts a test application.

(async () => {
  try {
    const path = require('path');
    const { pathToFileURL } = require('url');
    const dbPath = pathToFileURL(path.resolve(__dirname, '..', 'api', '_lib', 'db.js')).href;
    const mod = await import(dbPath);
    const db = mod.default || mod;

    const payload = {
      nickname: 'FireTestUser',
      discord: 'Fire#0001',
      aternos_username: `autotest_fire_${Date.now()}`,
      reason: 'Automated Firestore insertion test. This message is long enough.',
      status: 'pending',
    };

    console.log('Inserting payload:', payload);
    const { data, error } = await db.insertApplication(payload);
    if (error) {
      console.error('Insert error:', error);
      process.exit(2);
    }
    console.log('Insert successful. Returned row:');
    console.log(data);
    process.exit(0);
  } catch (err) {
    console.error('Test script failed:', err);
    process.exit(99);
  }
})();

// Cleanup script: Delete test applications using new service layer
// Usage (PowerShell):
// $env:SUPABASE_URL='https://...'
// $env:SUPABASE_SERVICE_KEY='your_service_role'
// node scripts/cleanup_test_applications.js

import { pathToFileURL } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  try {
    // Import services
    const databaseFactoryPath = pathToFileURL(path.resolve(__dirname, '..', 'api', '_lib', 'factory', 'DatabaseFactory.js')).href;
    const appServicePath = pathToFileURL(path.resolve(__dirname, '..', 'api', '_lib', 'services', 'ApplicationService.js')).href;
    
    const { databaseFactory } = await import(databaseFactoryPath);
    const { ApplicationService } = await import(appServicePath);

    console.log('Fetching applications...');
    
    // Get repository and create service
    const appRepo = databaseFactory.getApplicationRepository();
    const appService = new ApplicationService(appRepo);
    
    const result = await appService.getApplications();
    if (!result.success) {
      console.error('Failed to fetch applications:', result.error);
      process.exit(2);
    }

    const apps = result.data || [];
    const candidates = apps.filter(a => typeof a.aternos_username === 'string' && /^autotest_/.test(a.aternos_username));
    
    if (!candidates.length) {
      console.log('No test applications found.');
      process.exit(0);
    }

    console.log(`Found ${candidates.length} test application(s). Deleting...`);
    for (const app of candidates) {
      try {
        const deleteResult = await appService.deleteApplication(app.id);
        if (deleteResult.success) {
          console.log('Deleted:', app.id, app.aternos_username);
        } else {
          console.error('Failed to delete', app.id, deleteResult.error);
        }
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

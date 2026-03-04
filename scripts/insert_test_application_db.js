// Test script: Insert test application using new service layer
// Usage (PowerShell):
// $env:SUPABASE_URL='https://...'
// $env:SUPABASE_SERVICE_KEY='your_service_role'
// node scripts/insert_test_application_db.js

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

    const payload = {
      nickname: 'FireTestUser',
      discord: 'Fire#0001',
      aternos_username: `autotest_fire_${Date.now()}`,
      reason: 'Automated test insertion using new service layer. This message is long enough.',
      status: 'pending',
    };

    console.log('Inserting payload:', payload);
    
    // Get repository and create service
    const appRepo = databaseFactory.getApplicationRepository();
    const appService = new ApplicationService(appRepo);
    
    // Submit application
    const result = await appService.submitApplication(payload);
    
    if (!result.success) {
      console.error('Insert error:', result.error);
      process.exit(2);
    }
    
    console.log('Insert successful. Returned application:');
    console.log(result.data);
    process.exit(0);
  } catch (err) {
    console.error('Test script failed:', err);
    process.exit(99);
  }
})();

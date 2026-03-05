import { databaseFactory } from '../api/_lib/factory/DatabaseFactory.js';
import { ApplicationService } from '../api/_lib/services/ApplicationService.js';

(async () => {
  try {
    console.log('Testing status-check endpoint logic...');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
    console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Missing');
    
    const appRepo = databaseFactory.getApplicationRepository();
    const appService = new ApplicationService(appRepo);
    
    // Test 1: Check status for non-existent user
    console.log('\n--- Test 1: Non-existent user ---');
    const result1 = await appService.checkApplicationStatus('nonexistent');
    console.log(JSON.stringify(result1, null, 2));
    
    // Test 2: Check status for existing user
    console.log('\n--- Test 2: Existing user ---');
    const result2 = await appService.checkApplicationStatus('testapp_1772636830560');
    console.log(JSON.stringify(result2, null, 2));
    
    // Test 3: Try with different case
    console.log('\n--- Test 3: Different case ---');
    const result3 = await appService.checkApplicationStatus('TESTAPP_1772636830560');
    console.log(JSON.stringify(result3, null, 2));
    
    console.log('\n✅ All tests passed');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(99);
  }
})();

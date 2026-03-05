import { databaseFactory } from '../api/_lib/factory/DatabaseFactory.js';
import { ApplicationService } from '../api/_lib/services/ApplicationService.js';

(async () => {
  try {
    console.log('Testing checkApplicationStatus method...');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
    console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Missing');
    
    const appRepo = databaseFactory.getApplicationRepository();
    const appService = new ApplicationService(appRepo);
    
    // Test with the application we created earlier
    console.log('\nTesting with aternos_username: testapp_1772636830560');
    const result = await appService.checkApplicationStatus('testapp_1772636830560');
    
    console.log('\nResult:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ checkApplicationStatus works!');
      console.log('Status:', result.data.status);
      process.exit(0);
    } else {
      console.log('\n❌ Failed:', result.error);
      process.exit(1);
    }
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(99);
  }
})();

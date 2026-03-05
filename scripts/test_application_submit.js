import { databaseFactory } from '../api/_lib/factory/DatabaseFactory.js';
import { ApplicationService } from '../api/_lib/services/ApplicationService.js';

const payload = {
  nickname: 'TestUser',
  discord: 'Test#0001',
  aternos_username: `testapp_${Date.now()}`,
  reason: 'This is a test application to verify submission works.'
};

(async () => {
  try {
    console.log('Testing application submission...');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
    console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Missing');
    console.log('\nSubmitting payload:', JSON.stringify(payload, null, 2));
    
    const appRepo = databaseFactory.getApplicationRepository();
    const appService = new ApplicationService(appRepo);
    
    const result = await appService.submitApplication(payload);
    
    console.log('\nResult:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ Application submission successful!');
      console.log('Application ID:', result.data.id);
      process.exit(0);
    } else {
      console.log('\n❌ Submission failed:', result.error);
      process.exit(1);
    }
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(99);
  }
})();

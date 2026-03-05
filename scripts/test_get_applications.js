import { databaseFactory } from '../api/_lib/factory/DatabaseFactory.js';
import { ApplicationService } from '../api/_lib/services/ApplicationService.js';

(async () => {
  try {
    console.log('Fetching all applications...');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
    console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Missing');
    
    const appRepo = databaseFactory.getApplicationRepository();
    const appService = new ApplicationService(appRepo);
    
    const result = await appService.getApplications();
    
    console.log('\nResult:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log(`\n✅ Found ${result.data.length} application(s)`);
      result.data.forEach((app, idx) => {
        console.log(`  ${idx + 1}. ${app.aternos_username} (${app.status})`);
      });
      process.exit(0);
    } else {
      console.log('\n❌ Failed to fetch applications:', result.error);
      process.exit(1);
    }
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(99);
  }
})();

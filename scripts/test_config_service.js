import { createClient } from '@supabase/supabase-js';
import { databaseFactory } from '../api/_lib/factory/DatabaseFactory.js';
import { ConfigService } from '../api/_lib/services/ConfigService.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  try {
    console.log('Testing ConfigService...');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✓ Set' : '✗ Missing');
    console.log('SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✓ Set' : '✗ Missing');
    
    // Test through DatabaseFactory
    const configRepo = databaseFactory.getConfigRepository();
    const configService = new ConfigService(configRepo);
    
    console.log('\n1. Testing getPublicConfig()...');
    const publicResult = await configService.getPublicConfig();
    console.log('Result:', JSON.stringify(publicResult, null, 2));
    
    console.log('\n2. Testing getAllConfig()...');
    const allResult = await configService.getAllConfig();
    console.log('Result:', JSON.stringify(allResult, null, 2));
    
    if (publicResult.success && allResult.success) {
      console.log('\n✅ ConfigService is working correctly!');
      process.exit(0);
    } else {
      console.log('\n❌ ConfigService returned errors');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(99);
  }
})();

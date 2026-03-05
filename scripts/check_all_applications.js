import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  try {
    console.log('Checking all applications in Supabase...\n');
    
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error:', error);
      process.exit(1);
    }
    
    console.log(`Found ${data?.length || 0} application(s):\n`);
    
    if (!data || data.length === 0) {
      console.log('No applications found.');
    } else {
      data.forEach((app, idx) => {
        console.log(`${idx + 1}. ${app.aternos_username}`);
        console.log(`   Nickname: ${app.nickname}`);
        console.log(`   Discord: ${app.discord}`);
        console.log(`   Status: ${app.status}`);
        console.log(`   Created: ${app.created_at}`);
        console.log();
      });
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(99);
  }
})();

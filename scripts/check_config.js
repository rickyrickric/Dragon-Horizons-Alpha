import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

(async () => {
  try {
    console.log('Checking site_config table...');
    const { data, error } = await supabase.from('site_config').select('*');
    
    if (error) {
      console.error('Error:', error);
      process.exit(1);
    }
    
    console.log(`Found ${data?.length || 0} config items:`);
    console.log(JSON.stringify(data, null, 2));
    
    if (!data || data.length === 0) {
      console.log('\n⚠ Config table is empty! Inserting defaults...');
      
      const { error: insertError } = await supabase.from('site_config').insert([
        { key: 'drive_link', value: 'https://drive.google.com/drive/folders/1NTOkHghetyqPZpHnSKdQZaqhVz1f3b9N' },
        { key: 'pack_version', value: 'v1.0.1' },
        { key: 'server_address', value: 'recktsdragonhorizon.aternos.me' },
        { key: 'server_port', value: '20126' }
      ]);
      
      if (insertError) {
        console.error('Insert error:', insertError);
        process.exit(1);
      }
      
      console.log('✅ Defaults inserted successfully!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(99);
  }
})();

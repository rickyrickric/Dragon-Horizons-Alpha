// Inserts a test application into Supabase when env vars are present.
// Usage (Windows PowerShell):
// $env:SUPABASE_URL='https://...'; $env:SUPABASE_SERVICE_KEY='service_role_key'; node scripts/insert_test_application.js

const process = require('process');
const { createClient } = require('@supabase/supabase-js');

async function main(){
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if(!url || !key){
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment. Aborting real insert.');
    console.error('To run a real test, set the env vars and re-run.');
    process.exit(1);
  }

  const supabase = createClient(url, key);

  const payload = {
    nickname: 'AutoTestUser',
    discord: 'Auto#0001',
    aternos_username: `autotest_${Date.now()}`,
    reason: 'Automated integration test insertion from local script.',
    status: 'pending'
  };

  console.log('Inserting payload into Supabase applications table:', payload);
  const { data, error } = await supabase.from('applications').insert(payload).select().single();
  if(error){
    console.error('Supabase insert error:', error);
    process.exit(2);
  }

  console.log('Insert successful. Returned row:');
  console.log(data);
}

main().catch(err=>{console.error(err);process.exit(99)});

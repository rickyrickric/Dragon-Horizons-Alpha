#!/usr/bin/env node

/**
 * Database initialization checker
 * Verifies if required tables exist
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkTableExists(tableName) {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('id', { count: 'exact', head: true })
      .limit(1);
    
    // If there's no error, the table exists
    return !error;
  } catch (err) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking database tables...\n');
  
  const tables = [
    'applications',
    'admin_keys',
    'config',
    'mod_recommendations'
  ];
  
  const status = {};
  
  for (const table of tables) {
    const exists = await checkTableExists(table);
    status[table] = exists;
    console.log(`  ${exists ? '✅' : '❌'} ${table}`);
  }
  
  console.log('\n📋 Important: Database Setup\n');
  
  if (!status.mod_recommendations) {
    console.log('⚠️  The mod_recommendations table does not exist.');
    console.log('To create it, follow these steps:\n');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to "SQL Editor"');
    console.log('4. Click "New Query"');
    console.log('5. Copy the contents of: migrations/create_mod_recommendations.sql');
    console.log('6. Paste and run the query\n');
    console.log('The migration will create the mod_recommendations table with proper indexes.\n');
  } else {
    console.log('✅ All tables are properly configured!\n');
  }
}

main().catch(console.error);



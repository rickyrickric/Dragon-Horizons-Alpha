// Mock test: simulate POST /api/applications without real Supabase
(function(){
  // Mock request body
  const body = {
    nickname: 'TestUser',
    discord: 'Tester#0001',
    aternos_username: 'testuser',
    reason: 'I love challenging modpacks and want to help test the server.'
  };

  // Validation (copied from api/_lib/validate.js)
  function validateApplication(b){
    const { nickname, discord, aternos_username, reason } = b;
    const errors = [];
    if (!nickname?.trim())          errors.push('Nickname is required.');
    if (!discord?.trim())           errors.push('Discord tag is required.');
    if (!aternos_username?.trim())  errors.push('Aternos username is required.');
    if (!reason?.trim())            errors.push('Reason is required.');
    if (reason?.trim().length < 20) errors.push('Please write at least 20 characters for your reason.');
    return errors;
  }

  console.log('\nMock test: POST /api/applications');
  const errors = validateApplication(body);
  if (errors.length) {
    console.error('Validation failed:', errors.join(' '));
    process.exit(1);
  }

  // Mock Supabase duplicate check (simulate none found)
  const existing = null; // set to an object to simulate duplicate
  if (existing) {
    console.log('Duplicate found, would return 409 with message.');
    process.exit(0);
  }

  // Prepare payload that would be inserted
  const payload = {
    nickname: body.nickname.trim(),
    discord: body.discord.trim(),
    aternos_username: body.aternos_username.trim().toLowerCase(),
    reason: body.reason.trim(),
    status: 'pending'
  };

  // Mock insert result
  const inserted = Object.assign({ id: 999, created_at: new Date().toISOString() }, payload);

  console.log('Validation passed. Would insert the following payload into `applications` table:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\nMocked DB response:');
  console.log(JSON.stringify(inserted, null, 2));
  console.log('\nAPI response (simulated):', JSON.stringify({ message: 'Application submitted!', id: inserted.id }, null, 2));
})();

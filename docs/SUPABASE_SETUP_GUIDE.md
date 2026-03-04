# Supabase Setup & Connection Guide

## Step 1: Create Supabase Project

### 1.1 Go to Supabase
1. Visit https://supabase.com
2. Click **Sign Up** (or Sign In if you have account)
3. Use GitHub or Email to register

### 1.2 Create New Project
1. Click **New Project**
2. Fill in:
   - **Project Name**: `dragon-horizons`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
3. Click **Create New Project**
4. Wait 1-2 minutes for initialization

---

## Step 2: Get Your Credentials

### 2.1 Find Your Connection Details
1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them):
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Service Role Key** (looks like `sb_secret_xxxxx`)

### 2.2 Set Environment Variables

#### For Local Development (PowerShell):
```powershell
$env:SUPABASE_URL='https://your-project.supabase.co'
$env:SUPABASE_SERVICE_KEY='sb_secret_xxxxx'
$env:ADMIN_SECRET='your-secret-password-here'
```

#### For Production (Vercel):
1. Go to Vercel Dashboard
2. Select **dragon-horizons-alpha** project
3. Click **Settings** → **Environment Variables**
4. Add three variables:
   - `SUPABASE_URL` = (your project URL)
   - `SUPABASE_SERVICE_KEY` = (your service role key)
   - `ADMIN_SECRET` = (same as local)
5. Select **Production, Preview, Development**
6. Click **Save**
7. Redeploy your project

---

## Step 3: Create Database Tables

### 3.1 Open SQL Editor
1. In Supabase, go to **SQL Editor**
2. Click **New Query**

### 3.2 Create Tables

#### Table 1: applications
```sql
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(255) NOT NULL,
  discord VARCHAR(255) NOT NULL,
  aternos_username VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  
  UNIQUE(aternos_username)
);

CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_created ON applications(created_at DESC);
```
**Click Run** (or Ctrl+Enter)

#### Table 2: site_config
```sql
CREATE TABLE IF NOT EXISTS site_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default values
INSERT INTO site_config (key, value) VALUES
  ('drive_link', 'https://drive.google.com/drive/folders/1NTOkHghetyqPZpHnSKdQZaqhVz1f3b9N'),
  ('pack_version', 'v1.0.1'),
  ('server_address', 'recktsdragonhorizon.aternos.me'),
  ('server_port', '20126')
ON CONFLICT (key) DO NOTHING;
```
**Click Run**

#### Table 3: admin_keys (NEW)
```sql
CREATE TABLE IF NOT EXISTS admin_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name VARCHAR(50) NOT NULL UNIQUE,
  key_value VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_key_name CHECK (key_name IN ('event', 'maintenance', 'status'))
);

CREATE INDEX idx_admin_keys_name ON admin_keys(key_name);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_admin_keys_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS admin_keys_update_timestamp ON admin_keys;
CREATE TRIGGER admin_keys_update_timestamp
BEFORE UPDATE ON admin_keys
FOR EACH ROW
EXECUTE FUNCTION update_admin_keys_timestamp();

-- Insert default keys
INSERT INTO admin_keys (key_name, key_value, description) VALUES
  ('event', 'event_key_default_12345', 'Key for managing server events'),
  ('maintenance', 'maintenance_key_default_12345', 'Key for maintenance mode'),
  ('status', 'status_key_default_12345', 'Key for server status')
ON CONFLICT (key_name) DO NOTHING;
```
**Click Run**

#### Table 4: server_entries (Existing, if missing)
```sql
CREATE TABLE IF NOT EXISTS server_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(255),
  discord VARCHAR(255),
  aternos_username VARCHAR(255),
  ip VARCHAR(50),
  user_agent TEXT,
  source VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_server_entries_created ON server_entries(created_at DESC);
CREATE INDEX idx_server_entries_aternos ON server_entries(aternos_username);
```
**Click Run**

---

## Step 4: Configure Supabase Settings

### 4.1 Enable RLS (Row Level Security)
By default, RLS prevents all access. We'll use service role key (server-side) for API calls.

1. Go to **Authentication** → **Policies**
2. For each table (applications, site_config, admin_keys, server_entries):
   - Click the table
   - Check "Enable RLS"
   - For now, we'll use Service Role Key which bypasses RLS

### 4.2 Verify Connection
Run this in your terminal:
```powershell
$env:SUPABASE_URL='https://your-project.supabase.co'
$env:SUPABASE_SERVICE_KEY='sb_secret_xxxxx'
node scripts/insert_test_application_db.js
```

If successful, you should see: **Exit Code 0**

---

## Step 5: Connect Your Endpoints (Code Examples)

### Example 1: Refactor `/api/applications/index.js`

#### BEFORE (Old):
```javascript
import db from '../_lib/db.js';

export default async function handler(req, res) {
  // ...
  const { data, error } = await db.insertApplication(payload);
}
```

#### AFTER (New):
```javascript
import { databaseFactory } from '../_lib/factory/DatabaseFactory.js';
import { ApplicationService } from '../_lib/services/ApplicationService.js';
import { parseBody, requireAdmin, cors } from '../_lib/auth.js';
import { ok, fail, denied } from '../_lib/respond.js';
import { validateApplication } from '../_lib/validate.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // POST: Submit application
  if (req.method === 'POST') {
    const body = parseBody(req);
    const errors = validateApplication(body);
    if (errors.length) return fail(res, errors.join(' '));

    // Create service
    const appRepo = databaseFactory.getApplicationRepository();
    const appService = new ApplicationService(appRepo);

    // Use service
    const result = await appService.submitApplication(body);
    
    if (!result.success) return fail(res, result.error, 409);
    return ok(res, { message: 'Application submitted!', id: result.data.id }, 201);
  }

  // GET: List applications (admin only)
  if (req.method === 'GET') {
    const auth = requireAdmin(req);
    if (!auth.ok) return denied(res);

    const appRepo = databaseFactory.getApplicationRepository();
    const appService = new ApplicationService(appRepo);
    
    const result = await appService.getApplications(req.query.status);
    
    if (!result.success) return fail(res, result.error, 500);
    return ok(res, { applications: result.data });
  }

  return fail(res, 'Method not allowed.', 405);
}
```

### Example 2: Refactor `/api/config.js`

#### BEFORE:
```javascript
import db from './_lib/db.js';

export default async function handler(req, res) {
  // ...
  const { data, error } = await db.getConfig();
}
```

#### AFTER:
```javascript
import { databaseFactory } from './_lib/factory/DatabaseFactory.js';
import { ConfigService } from './_lib/services/ConfigService.js';
import { requireAdmin, parseBody, cors } from './_lib/auth.js';
import { ok, fail, denied } from './_lib/respond.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const configRepo = databaseFactory.getConfigRepository();
  const configService = new ConfigService(configRepo);

  // GET: Read config
  if (req.method === 'GET') {
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    const isAdmin = token && token === process.env.ADMIN_SECRET;

    const result = isAdmin 
      ? await configService.getAllConfig()
      : await configService.getPublicConfig();

    if (!result.success) return fail(res, result.error, 500);
    return ok(res, { config: result.data, admin: isAdmin });
  }

  // PATCH: Update config (admin only)
  if (req.method === 'PATCH') {
    const auth = requireAdmin(req);
    if (!auth.ok) return denied(res);

    const body = parseBody(req);
    const result = await configService.updateConfig(body);

    if (!result.success) return fail(res, result.error, 500);
    return ok(res, { message: 'Config updated.', data: result.data });
  }

  return fail(res, 'Method not allowed.', 405);
}
```

### Example 3: Refactor `/api/applications/[id].js`

#### AFTER:
```javascript
import { databaseFactory } from '../../_lib/factory/DatabaseFactory.js';
import { ApplicationService } from '../../_lib/services/ApplicationService.js';
import { requireAdmin, parseBody, cors } from '../../_lib/auth.js';
import { ok, fail, denied, notFound } from '../../_lib/respond.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = requireAdmin(req);
  if (!auth.ok) return denied(res);

  const { id } = req.query;
  const appRepo = databaseFactory.getApplicationRepository();
  const appService = new ApplicationService(appRepo);

  // GET: Single application
  if (req.method === 'GET') {
    const result = await appService.getApplication(id);
    if (!result.success) return notFound(res);
    return ok(res, { application: result.data });
  }

  // PATCH: Update status
  if (req.method === 'PATCH') {
    const body = parseBody(req);
    const result = await appService.updateApplicationStatus(
      id,
      body.status,
      body.admin_note
    );

    if (!result.success) return fail(res, result.error, 500);
    return ok(res, { application: result.data });
  }

  // DELETE: Remove application
  if (req.method === 'DELETE') {
    const result = await appService.deleteApplication(id);
    if (!result.success) return fail(res, result.error, 500);
    return ok(res, { message: 'Application deleted.' });
  }

  return fail(res, 'Method not allowed.', 405);
}
```

---

## Step 6: Test Your Connection

### 6.1 Test Local
```powershell
# Set env vars
$env:SUPABASE_URL='https://your-project.supabase.co'
$env:SUPABASE_SERVICE_KEY='sb_secret_xxxxx'
$env:ADMIN_SECRET='your-password'

# Run test
node scripts/insert_test_application_db.js
```

Should output: **Exit Code 0** ✅

### 6.2 Test Cleanup
```powershell
node scripts/cleanup_test_applications.js
```

Should output: **Exit Code 0** ✅

---

## Step 7: Verify Database Content

In Supabase Dashboard:
1. Go to **Table Editor**
2. Click each table:
   - `applications` - Should be empty (or have test data)
   - `site_config` - Should have 4 rows (drive_link, pack_version, etc.)
   - `admin_keys` - Should have 3 rows (event, maintenance, status)
   - `server_entries` - Should be empty

---

## Step 8: Deploy to Vercel

### 8.1 Update Code
Commit your refactored endpoints to GitHub:
```powershell
git add api/
git commit -m "refactor(endpoints): migrate to use new service layer"
git push
```

### 8.2 Set Environment Variables in Vercel
Already done in **Step 2.2** above!

### 8.3 Trigger Redeploy
1. Vercel Dashboard → **dragon-horizons-alpha** → **Deployments**
2. Click three dots on latest deployment
3. Select **Redeploy**
4. Wait for build to complete

---

## Troubleshooting

### "SUPABASE_URL is missing"
- Make sure env vars are set in Vercel Project Settings
- Verify you selected Production environment
- Redeploy after setting vars

### "Service key invalid"
- Check you're using **Service Role Key**, not Anon Key
- Service role starts with `sb_service_`

### "Table does not exist"
- Make sure you ran all SQL queries in Step 3
- No errors should appear when running SQL

### "Connection refused"
- Verify SUPABASE_URL is correct (ends with `.supabase.co`)
- Check that Supabase project is running

---

## What's Connected Now

```
Frontend (HTML forms)
         ↓
API Endpoints (using Services)
         ↓
Services (BusinessLogic)
         ↓
DatabaseFactory (Dependency Injection)
         ↓
Repositories (Data Access)
         ↓
Supabase (Database)
```

All layers now properly separated and tested! 🎉


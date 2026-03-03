# Dragon Horizons — Complete Setup Guide

## Problem Summary (Your Issues)

1. **Admin Panel is empty** → Missing `applications` table
2. **Site config failed to load** → Missing `site_config` table  
3. **Server entries DB null** → Missing `server_entries` table

## Solution: Run the Migration

### Step 1: Copy Migration SQL

Open `migrations/create_server_entries.sql` — it contains all 3 required tables in one script.

### Step 2: Run in Supabase

1. Log in to your [Supabase project](https://supabase.com)
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Paste the entire contents of `migrations/create_server_entries.sql`
5. Click **Run**

You should see:
- ✅ `CREATE TABLE IF NOT EXISTS applications`
- ✅ `CREATE TABLE IF NOT EXISTS site_config`
- ✅ `CREATE TABLE IF NOT EXISTS server_entries`
- ✅ `INSERT INTO site_config` (pre-populated defaults)

### Step 3: Set Environment Variables

Deploy these to your hosting platform (Vercel, Netlify, etc.):

```
SUPABASE_URL=https://[YOUR_PROJECT_ID].supabase.co
SUPABASE_SERVICE_KEY=eyJ... (get from Settings → API → Service Role)
ADMIN_SECRET=your-chosen-password
```

⚠️ **Critical:**  
- Use **Service Role** key (not Anon key)
- Never expose these in frontend code
- Keep `.env` local only; use platform's secret manager for production

### Step 4: Verify

After deploying env vars:

1. **Test Admin Panel:**
   - Open `https://your-site.com/admin.html`
   - Enter your `ADMIN_SECRET`
   - You should see stats (all 0 initially) and tabs for Applications & Config

2. **Test Config Load:**
   - Click **Site Config** tab
   - You should see pre-filled fields:
     - Drive Link: `https://drive.google.com/drive/folders/YOUR_FOLDER_ID_HERE`
     - Server Address: `recktsdragonhorizon.aternos.me`
     - Server Port: `20126`
     - Pack Version: `v1.0.1 Alpha`
   - Update drive link, click **Save Changes** → should see ✅ toast

3. **Test Entry Tracking:**
   - POST to `/api/enter`:
     ```bash
     curl -X POST https://your-site.com/api/enter \
       -H "Content-Type: application/json" \
       -d '{"nickname":"Test","aternos_username":"test123"}'
     ```
   - Should return `{ success: true, message: "Entry recorded.", id: 1 }`

4. **View Entries (Admin):**
   - Curl with admin auth:
     ```bash
     curl -H "Authorization: Bearer $ADMIN_SECRET" \
       https://your-site.com/api/server_entries
     ```
   - Should return the entry you just created

---

## What Each Table Does

| Table | Purpose | Used By |
|-------|---------|---------|
| `applications` | Player applications for server access | Admin panel, `/api/applications` |
| `site_config` | Global config (drive link, server address) | Admin panel config form, `/api/config` |
| `server_entries` | Entry event tracking | `/api/enter` entry recording, admin list |

---

## Troubleshooting

### Admin Panel still empty after login

**Cause:** `applications` table exists but is empty (no applications submitted yet)  
**Fix:** Try submitting an application via `/apply.html` → it should appear in admin panel

### "Failed to load config" message in Site Config tab

**Cause:** `site_config` table doesn't exist OR env vars not set  
**Fix:** 
1. Re-run migration SQL (check for errors in Supabase)
2. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set in production

### POST to `/api/enter` fails with 500

**Cause:** `server_entries` table doesn't exist OR Supabase connection issue  
**Fix:**
1. Check migration ran successfully (Supabase SQL Editor → Table Editor → see `server_entries`)
2. Check `SUPABASE_SERVICE_KEY` is correct (copy from Settings → API → Service Role)

### Admin login fails

**Cause:** Wrong password OR `ADMIN_SECRET` not set  
**Fix:**
1. Check your `ADMIN_SECRET` env var matches what you entered
2. Rebuild/redeploy to pick up new env vars

---

## Next Steps (What You Can Do Now)

- [ ] Run migration SQL in Supabase
- [ ] Set and deploy env vars
- [ ] Test admin panel login
- [ ] Update drive link in Site Config
- [ ] Test application form submission
- [ ] View applications in admin panel

All docs are in `docs/` folder for reference.

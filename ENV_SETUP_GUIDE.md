# 🔧 Environment Variables Setup Guide

## Required Environment Variables

The application requires the following environment variables to be set:

### 1. **SUPABASE_URL** (Required)
Your Supabase project API URL
- Get it from: https://supabase.com/dashboard → Select Project → Settings → API
- Format: `https://your-project-ref.supabase.co`

### 2. **SUPABASE_SERVICE_KEY** (Required)
Your Supabase service role key (for server-side operations)
- Get it from: https://supabase.com/dashboard → Select Project → Settings → API
- **IMPORTANT**: Use the **Service Role Key**, not the anon key
- This key should NEVER be exposed to clients

### 3. **ADMIN_SECRET** (Required for Admin Operations)
Your custom admin authentication secret
- Choose a strong random string (at least 32 characters)
- Example: `"your_secure_random_admin_secret_string_here"`

## Setup Instructions

### Local Development

1. **Create `.env` file** in the project root:
```bash
cp .env.example .env
```

2. **Edit `.env`** with your actual values:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
ADMIN_SECRET=your_secure_admin_secret_here
```

3. **Verify setup** by running:
```bash
node scripts/init-db.js
```

You should see:
```
🔍 Checking database tables...

  ✅ applications
  ✅ admin_keys
  ✅ config
  ✅ mod_recommendations

✅ All tables are properly configured!
```

### Vercel Deployment

1. Go to your Vercel project → Settings → Environment Variables
2. Add the three variables (SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_SECRET)
3. Redeploy your project

### Common Issues

**"Database not configured" error**
- Check that both SUPABASE_URL and SUPABASE_SERVICE_KEY are set
- Verify no trailing/leading whitespace in values
- Ensure you're using the SERVICE ROLE KEY, not the anon key

**"mod_recommendations table does not exist"**
- Run the database migration:
  1. Go to Supabase dashboard
  2. SQL Editor → New Query
  3. Copy contents of `migrations/create_mod_recommendations.sql`
  4. Run the query

**Port conflicts**
- Default API port: 3000
- Change with: `PORT=3001 npm run dev`

## Troubleshooting

If you see "Failed to fetch recommendations" in the admin dashboard:

1. Check `.env` file exists and has values
2. Run `node scripts/init-db.js` to verify Supabase connectivity
3. Check browser console for detailed error messages
4. Check server logs: `npm run dev` should show any errors

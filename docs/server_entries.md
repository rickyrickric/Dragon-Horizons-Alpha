# Server Entries: schema and usage

This document describes the `server_entries` table and how to send an event to `/api/enter`.

Schema (see `migrations/create_server_entries.sql`):

- `id` (bigserial) primary key
- `nickname` (text) optional
- `discord` (text) optional
- `aternos_username` (text) optional, normalized to lowercase
- `ip` (text) captured from `X-Forwarded-For` or socket
- `user_agent` (text)
- `source` (text) referer or provided source
- `created_at` (timestamptz) default now()

Run migration in Supabase SQL editor using `migrations/create_server_entries.sql`.

Example curl (POST):

```bash
curl -X POST https://your-site.example.com/api/enter \
  -H "Content-Type: application/json" \
  -d '{"nickname":"PlayerOne","discord":"player#1234","aternos_username":"playerone"}'
```

Notes
- Ensure `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are configured in your deployment environment.
- The API returns JSON `{ success: true, message: 'Entry recorded.', id: <id> }` on success.

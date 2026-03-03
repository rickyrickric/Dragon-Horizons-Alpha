# Database Setup & API Documentation

## Required Tables

The Dragon Horizons backend requires **3 Supabase tables**. All are defined in a single migration file.

### Quick Setup

1. **Open your Supabase project → SQL Editor**
2. **Copy and paste the entire contents of `migrations/create_server_entries.sql`**
3. **Run the SQL** (it creates all three tables with indexes and pre-populated defaults)

---

## Table 1: `applications`

Stores player applications submitted via `/api/applications`.

**Schema:**
```
id (bigserial) primary key
nickname (text) not null
discord (text) not null
aternos_username (text) not null unique
reason (text) not null
status (text) default 'pending' — pending | accepted | rejected
admin_note (text) optional note from admin
reviewed_at (timestamptz) when admin reviewed
created_at (timestamptz) auto now
updated_at (timestamptz) auto now
```

**Indexes:**
- `status` (for filtering in admin panel)
- `aternos_username` (for duplicate checks)
- `created_at desc` (for sorting recent first)

---

## Table 2: `site_config`

Global key-value configuration for public pages.

**Schema:**
```
key (text) primary key
value (text) not null
updated_at (timestamptz) auto now
```

**Pre-populated keys:**
- `drive_link` — Google Drive download folder
- `server_address` — Aternos server address
- `server_port` — Port number
- `pack_version` — Current modpack version

Update via admin panel → Site Config tab (requires `ADMIN_SECRET`).

---

## Table 3: `server_entries`

Event tracking for server entry attempts via `/api/enter`.

**Schema:**
```
id (bigserial) primary key
nickname (text)
discord (text)
aternos_username (text)
ip (text) captured from request
user_agent (text)
source (text) referer or provided source
created_at (timestamptz) auto now
```

**Indexes:**
- `aternos_username` (for lookups)
- `created_at desc` (for sorting recent first)

---

## API Endpoints

### POST `/api/enter` — Record Server Entry

Submit a server entry event (public, no auth).

**Request:**
```bash
curl -X POST https://your-site.example.com/api/enter \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "PlayerOne",
    "discord": "player#1234",
    "aternos_username": "playerone"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "Entry recorded.",
  "id": 42
}
```

**Validation:**
- At least `nickname` or `aternos_username` required
- Max 100 chars each field
- Returns `422` on validation error

---

### GET `/api/server_entries` — List Entries (Admin Only)

Retrieve recent server entries. Requires `Authorization: Bearer <ADMIN_SECRET>` header.

**Query params:**
- `?limit=50` — number of entries (default 100, max 1000)
- `?offset=100` — skip first N entries (default 0)
- `?id=<id>` — fetch single entry by ID

**Request:**
```bash
curl -H "Authorization: Bearer $ADMIN_SECRET" \
  "https://your-site.example.com/api/server_entries?limit=50"
```

**Response (200):**
```json
{
  "success": true,
  "entries": [
    {
      "id": 1,
      "nickname": "PlayerOne",
      "discord": "player#1234",
      "aternos_username": "playerone",
      "ip": "203.0.113.45",
      "user_agent": "Mozilla/5.0...",
      "source": "https://example.com/apply",
      "created_at": "2026-03-04T15:32:00Z"
    }
  ]
}
```

---

## Environment Setup

Set these on your hosting platform (Vercel, etc.):

```env
SUPABASE_URL = https://xxx.supabase.co
SUPABASE_SERVICE_KEY = eyJ... (service role key, server-side only — never expose)
ADMIN_SECRET = your-secret-password
```

⚠️ **Never expose the `SUPABASE_SERVICE_KEY` or `ADMIN_SECRET` in frontend code.**

---

## Admin Panel Access

Once tables are created and env vars set:

1. Open `https://your-site.example.com/admin.html`
2. Enter your `ADMIN_SECRET` password
3. View application stats, manage applications, update config (drive link, server address, etc.)



# Dragon Horizons - Architecture & Implementation Guide

## Project Goal

A Minecraft modpack server management system with:
- **Player Portal**: Application form to join the server
- **Mod Protection**: Only accepted players can download mods
- **Admin Panel**: Manage applications and server configuration
- **Event System**: Schedule events and maintenance windows
- **Admin Keys**: 3 separate access keys for different admin functions

---

## Current Architecture (After SOLID Refactoring)

### Data Flow

```
User Fills Form
     ↓
HTML POST /api/applications
     ↓
API Handler (endpoint)
     ↓
ApplicationService (business logic)
     ↓
ApplicationRepository (data access)
     ↓
Supabase (database)
     ↓
Success Response → Show Alert
```

### Layer Structure

```
┌─────────────────────────────────────────┐
│      Frontend (HTML/CSS/JS)             │
│  - apply.html (submissions)             │
│  - admin.html (management)              │
│  - index.html (home + events)           │
│  - download.html (mod access)           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    API Endpoints (Controller Layer)      │
│  - /api/applications/*                  │
│  - /api/config                          │
│  - /api/admin/keys (TODO)               │
│  - /api/admin/events (TODO)             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    Services (Business Logic Layer)       │
│  - ApplicationService                   │
│  - ConfigService                        │
│  - AdminKeyService                      │
│  - EventService (TODO)                  │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Database Abstraction (Repository Layer)│
│  - ApplicationRepository                │
│  - ConfigRepository                     │
│  - AdminKeyRepository                   │
│  - EventRepository (TODO)               │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    Concrete Implementations              │
│  - SupabaseApplicationRepository        │
│  - SupabaseConfigRepository             │
│  - SupabaseAdminKeyRepository           │
│  - (FirestoreXyzRepository - TODO)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│    Database                             │
│  - Supabase (PostgreSQL) - PRIMARY      │
│  - Firestore (NoSQL) - OPTIONAL         │
└─────────────────────────────────────────┘
```

---

## How Each Component Works

### 1. Repository Pattern (Data Access)

**Purpose**: Abstract all database operations behind a contract/interface.

**Example: ApplicationRepository**

```javascript
// Interface definition
export class ApplicationRepository {
  async insert(payload) { /* contract */ }
  async findExisting(aternos_username) { /* contract */ }
  async getAll(status) { /* contract */ }
  async getById(id) { /* contract */ }
  async update(id, updates) { /* contract */ }
  async delete(id) { /* contract */ }
}

// Concrete implementation
export class SupabaseApplicationRepository extends ApplicationRepository {
  async insert(payload) {
    const { data, error } = await supabase
      .from('applications')
      .insert(payload)
      .select()
      .single();
    return { data, error };
  }
  // ... other methods
}
```

**When to use**: 
- When you need to add a new database backend (Firestore)
- Just implement the interface with different logic
- All services will work without changes ✨

---

### 2. Service Layer (Business Logic)

**Purpose**: Implement business rules and orchestrate repositories.

**Example: ApplicationService**

```javascript
export class ApplicationService {
  constructor(applicationRepository) {
    this.repo = applicationRepository;
  }

  async submitApplication(payload) {
    // Business rule: Check for duplicates
    const existing = await this.repo.findExisting(
      payload.aternos_username.trim().toLowerCase()
    );
    
    if (existing) {
      return { 
        success: false, 
        error: 'Application already pending'
      };
    }

    // Normalize data
    const normalized = {
      ...payload,
      aternos_username: payload.aternos_username.toLowerCase()
    };

    // Insert
    const { data, error } = await this.repo.insert(normalized);
    
    return { 
      success: !error, 
      data: { id: data.id }
    };
  }
}
```

**Benefits**:
- Business logic is testable (mock the repository)
- Same service works with Supabase or Firestore
- Easy to understand: service = what it does

---

### 3. Factory Pattern (Dependency Injection)

**Purpose**: Centralize instantiation of repositories and services.

```javascript
export const databaseFactory = new DatabaseFactory();

// Factory decides which backend
class DatabaseFactory {
  getApplicationRepository() {
    if (useFirebase) {
      return new FirestoreApplicationRepository();
    } else {
      return new SupabaseApplicationRepository();
    }
  }
}
```

**In endpoints**:
```javascript
// Don't do this (tightly coupled):
import db from './db.js';
const data = await db.getApplications();

// Do this instead (decoupled):
import { databaseFactory } from './_lib/factory/DatabaseFactory.js';
import { ApplicationService } from './_lib/services/ApplicationService.js';

const appRepo = databaseFactory.getApplicationRepository();
const appService = new ApplicationService(appRepo);
const { success, data } = await appService.getApplications();
```

---

## Database Tables

### 1. `applications` (Existing)
```
id: UUID PRIMARY KEY
nickname: VARCHAR
discord: VARCHAR
aternos_username: VARCHAR (UNIQUE constraint on pending+accepted)
reason: TEXT
status: VARCHAR (pending|accepted|rejected)
admin_note: TEXT (optional)
created_at: TIMESTAMP
reviewed_at: TIMESTAMP (nullable)
```

### 2. `site_config` (Existing)
```
key: VARCHAR PRIMARY KEY (drive_link, pack_version, server_address, server_port)
value: VARCHAR
```

### 3. `admin_keys` (NEW - Created in migration)
```
id: UUID PRIMARY KEY
key_name: VARCHAR UNIQUE (event|maintenance|status)
key_value: VARCHAR
description: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

**Schema**: `CREATE admin_keys` migration created and ready to run in Supabase.

---

## Implementation Checklist

### ✅ DONE
- [x] Repository pattern with 3 repository interfaces
- [x] Supabase implementations for all repositories
- [x] ApplicationService with full business logic
- [x] ConfigService with configuration management
- [x] AdminKeyService for 3 admin keys
- [x] DatabaseFactory for dependency injection
- [x] Migration for admin_keys table
- [x] Body parsing fix for API endpoints
- [x] Merge commit with all HTML robustness fixes
- [x] SOLID principles documentation

### 🔄 IN PROGRESS
- [ ] Add success alert to apply.html after submission

### ⏳ TODO (Priority Order)

#### Phase 1: Admin Key Management (Critical)
- [ ] Create `/api/admin/keys` endpoint
  - GET: List admin keys (metadata only, values hidden)
  - PATCH: Update keys (HTTP auth required)
  
- [ ] Add admin key UI tab to admin.html
  - Show current keys status (when they were updated)
  - Allow changing each key value
  - Display descriptions for each key

- [ ] Update admin.html login
  - Instead of single password field
  - Use 3 separate key fields (event, maintenance, status)
  - Require ALL 3 keys to enter admin panel
  - Store keys in sessionStorage (cleared on logout)

#### Phase 2: Event/Maintenance System
- [ ] Create `admin_events` table migration
- [ ] Create `EventRepository` interface & implementation
- [ ] Create `EventService` with business logic
- [ ] Create `/api/admin/events` endpoint
- [ ] Add Events tab to admin.html
- [ ] Display active events on home page (index.html)
- [ ] Display maintenance warning when active

#### Phase 3: Download Protection
- [ ] Create `/api/check-access` endpoint
  - Accept aternos_username query param
  - Check if accepted in applications table
  - Return { hasAccess: boolean }

- [ ] Modify download.html JavaScript
  - Call /api/check-access before allowing view
  - Hide download link if not accepted
  - Show message to apply if not accepted

#### Phase 4: Refactor Existing Endpoints
- [ ] Update `/api/applications/index.js`
  - Inject ApplicationService instead of using db directly
  - Use service methods for all operations

- [ ] Update `/api/applications/[id].js`
  - Same refactoring pattern

- [ ] Update `/api/config.js`
  - Inject ConfigService
  - Use service methods

---

## How to Add New Features (Example: Event System)

### Step 1: Create Repository Interface
```javascript
// api/_lib/repositories/EventRepository.js
export class EventRepository {
  async create(eventData) { throw new Error('Not implemented'); }
  async getActive() { throw new Error('Not implemented'); }
  async update(id, updates) { throw new Error('Not implemented'); }
  async delete(id) { throw new Error('Not implemented'); }
}
```

### Step 2: Implement for Supabase
```javascript
// api/_lib/repositories/SupabaseEventRepository.js
import { EventRepository } from './EventRepository.js';

export class SupabaseEventRepository extends EventRepository {
  async create(eventData) {
    const { data, error } = await supabase
      .from('admin_events')
      .insert(eventData)
      .select()
      .single();
    return { data, error };
  }
  // ... other methods
}
```

### Step 3: Update DatabaseFactory
```javascript
// api/_lib/factory/DatabaseFactory.js
getEventRepository() {
  if (!this._eventRepository) {
    this._eventRepository = new SupabaseEventRepository();
  }
  return this._eventRepository;
}
```

### Step 4: Create Service
```javascript
// api/_lib/services/EventService.js
export class EventService {
  constructor(eventRepository) {
    this.repo = eventRepository;
  }

  async createEvent(title, description, startTime, endTime) {
    // Business logic here
    return await this.repo.create({...});
  }
}
```

### Step 5: Create Endpoint
```javascript
// api/admin/events.js
import { databaseFactory } from '../_lib/factory/DatabaseFactory.js';
import { EventService } from '../_lib/services/EventService.js';

export default async function handler(req, res) {
  const eventRepo = databaseFactory.getEventRepository();
  const eventService = new EventService(eventRepo);
  
  if (req.method === 'POST') {
    const { success, data, error } = 
      await eventService.createEvent(...);
    if (success) return ok(res, { event: data });
    return fail(res, error);
  }
}
```

### Step 6: That's it! 
Backend is ready for frontend consumption. No need to refactor anything else.

---

## Testing Examples

### Test ApplicationService (Unit Test)
```javascript
// Mock the repository
class MockApplicationRepository {
  async insert(payload) {
    return { data: { id: 'test-id' }, error: null };
  }
  async findExisting(username) {
    return null; // No existing
  }
}

// Test the service
const mockRepo = new MockApplicationRepository();
const service = new ApplicationService(mockRepo);

const result = await service.submitApplication({
  nickname: 'TestPlayer',
  discord: 'Test#1234',
  aternos_username: 'TestAternos',
  reason: 'This is a valid reason longer than 20 chars'
});

assert(result.success === true);
assert(result.data.id === 'test-id');
```

### Test API Endpoint (Integration Test)
```javascript
// Use real service but mock repository
const mockRepo = new MockApplicationRepository();
const appService = new ApplicationService(mockRepo);

// Simulate HTTP request
const req = {
  method: 'POST',
  body: { /* application data */ }
};

const res = {
  status: (code) => ({ json: (data) => ({ code, data }) })
};

// Call handler
const result = await handler(req, res);
assert(result.code === 201);
```

---

## Environment Variables Required

### Development (Local)
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
ADMIN_SECRET=your-secret-password
```

### Production (Vercel)
Same as above, set in:
- Vercel Dashboard → Project Settings → Environment Variables
- Select: Production, Preview, Development

---

## Common Patterns

### Pattern 1: Use Service in Endpoint
```javascript
import { databaseFactory } from '../_lib/factory/DatabaseFactory.js';
import { ApplicationService } from '../_lib/services/ApplicationService.js';

const repo = databaseFactory.getApplicationRepository();
const service = new ApplicationService(repo);
const result = await service.methodName();
```

### Pattern 2: Validate Input, Use Service, Return Response
```javascript
const errors = validateSomething(req.body);
if (errors.length) return fail(res, errors.join(' '));

const result = await service.doSomething(req.body);
if (!result.success) return fail(res, result.error);

return ok(res, { data: result.data });
```

### Pattern 3: Admin-Only Endpoints
```javascript
const auth = requireAdmin(req);
if (!auth.ok) return denied(res);

// ... rest of logic
```

---

## File Structure

```
api/
├── _lib/
│   ├── auth.js                          ← HTTP auth helpers
│   ├── respond.js                       ← HTTP response helpers
│   ├── validate.js                      ← Input validation
│   ├── supabase.js                      ← Supabase client
│   ├── firebase.js                      ← Firebase client
│   ├── repositories/
│   │   ├── ApplicationRepository.js     ← Interface
│   │   ├── ConfigRepository.js          ← Interface
│   │   ├── AdminKeyRepository.js        ← Interface
│   │   ├── SupabaseApplicationRepository.js
│   │   ├── SupabaseConfigRepository.js
│   │   └── SupabaseAdminKeyRepository.js
│   ├── services/
│   │   ├── ApplicationService.js        ← Business logic
│   │   ├── ConfigService.js             ← Business logic
│   │   ├── AdminKeyService.js           ← Business logic
│   │   └── EventService.js              ← TODO
│   └── factory/
│       └── DatabaseFactory.js           ← Dependency injection
├── applications/
│   ├── index.js                         ← POST/GET applications
│   └── [id].js                          ← GET/PATCH/DELETE single
├── config.js                            ← GET/PATCH site config
├── admin/
│   ├── keys.js                          ← TODO: Admin key mgmt
│   └── events.js                        ← TODO: Event mgmt
├── debug/
│   ├── db-status.js                     ← Connection diagnostics
│   └── test-db.js                       ← DB test endpoint
├── enter.js                             ← Server entry logging
├── server_entries.js                    ← Server entries endpoint
└── status.js                            ← Server status endpoint

public/
├── apply.html                           ← Application form
├── admin.html                           ← Admin panel
├── index.html                           ← Home page
├── download.html                        ← Download instructions
├── about.html                           ← About page
├── mods.html                            ← Modlist
├── patchnotes.html                      ← Patch notes
└── style.css                            ← Styling

migrations/
├── create_server_entries.sql            ← Existing
├── add_test_policy.sql                  ← Existing
└── create_admin_keys.sql                ← NEW

docs/
├── SOLID_REFACTORING_PLAN.md
├── SOLID_IMPLEMENTATION_SUMMARY.md
└── ARCHITECTURE_GUIDE.md (this file)
```

---

## Next: Run the Migration

To create the admin_keys table:

1. Go to Supabase Dashboard
2. SQL Editor → New Query
3. Copy contents of `migrations/create_admin_keys.sql`
4. Execute

Or use Supabase CLI:
```bash
supabase migration up --database-url $SUPABASE_URL
```

---

## Monitoring & Debugging

### Check DB Status
```
GET /api/debug/db-status
Headers: Authorization: Bearer YOUR_ADMIN_SECRET
```

### Check Full DB Connection
```
GET /api/debug/test-db
Headers: Authorization: Bearer YOUR_ADMIN_SECRET
```

---

## Questions?

Read the documentation:
- `docs/SOLID_IMPLEMENTATION_SUMMARY.md` - Architecture overview
- `docs/SOLID_REFACTORING_PLAN.md` - Why each change was made
- This file - How to use and extend


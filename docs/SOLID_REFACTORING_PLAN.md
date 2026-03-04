# SOLID Refactoring Plan for Dragon Horizons

## Current State Analysis

### Violations of SOLID Principles

#### 1. **Single Responsibility Principle (SRP) Violations**
- **`api/_lib/db.js`**: Contains logic for both Supabase AND Firestore implementations in one file (180 lines)
  - Should split backends into separate modules
  - Should have a single database interface

- **API handlers** (`api/applications/index.js`, `api/config.js`): Mix business logic with HTTP layer
  - Validation, data access, and response handling all in one function
  - No separation of concerns

#### 2. **Open/Closed Principle (OCP) Violations**
- Database backend selection uses conditional checks throughout the file
  - Hard to extend with new backends without modifying existing code
  - Should use factory pattern or strategy pattern

- API endpoints can't be easily extended for new features without modifying core logic

#### 3. **Liskov Substitution Principle (LSP) Violations**
- Supabase and Firestore implementations don't have a formal contract/interface
  - They happen to return similar structures but it's not guaranteed
  - Can't easily swap implementations

#### 4. **Interface Segregation Principle (ISP) Violations**
- `db` object exports all functions even if a caller only needs config management
  - Admin endpoints don't need application functions
  - Should have separate interfaces for ApplicationRepository and ConfigRepository

#### 5. **Dependency Inversion Principle (DIP) Violations**
- API handlers directly import and use `db` module
  - Tightly coupled to specific database implementation
  - Hard to test with mocks or different backends

---

## Proposed Architecture

### 1. Service Layer (Business Logic)
Create services that encapsulate business rules:
- `ApplicationService`: Handle application submission, validation, status updates
- `ConfigService`: Handle site configuration (events, maintenance, status)
- `AdminKeyService`: Handle 3 admin keys (event, maintenance, status)

### 2. Repository Pattern (Data Access)
Abstract data access with repositories:
- `ApplicationRepository`: Contract for application CRUD operations
- `ConfigRepository`: Contract for configuration CRUD
- `AdminKeyRepository`: Contract for admin key storage

### 3. Concrete Implementations
- `SupabaseApplicationRepository`
- `SupabaseConfigRepository`
- `SupabaseAdminKeyRepository`
- (Optional Firestore versions)

### 4. Factory Pattern
Create database instances based on environment:
```
DatabaseFactory.createApplicationRepository()
DatabaseFactory.createConfigRepository()
DatabaseFactory.createAdminKeyRepository()
```

### 5. Request/Response Objects
Use DTOs (Data Transfer Objects) for HTTP layer:
- Standardize request/response formats
- Validate at endpoints before passing to services

---

## New Features to Add

### 1. Admin Keys Management
**Database Table**: `admin_keys`
```sql
CREATE TABLE admin_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name VARCHAR(50) NOT NULL UNIQUE,
  key_value VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Keys**:
- `event_key`: For setting event timers/details
- `maintenance_key`: For maintenance mode status
- `status_key`: For server status updates

### 2. Event/Maintenance Timer Feature
**Database Table**: `admin_events`
```sql
CREATE TABLE admin_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('event', 'maintenance')),
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'inactive')),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Application Submission Success Alert
- Add success modal/toast notification in `apply.html`
- Show confirmation with application ID
- Allow users to share/bookmark confirmation

---

## Implementation Steps

1. **Create Repository Interfaces** (TypeScript-like JSDoc)
   - Define contracts for data access

2. **Implement Repositories**
   - `SupabaseApplicationRepository`
   - `SupabaseConfigRepository`
   - `SupabaseAdminKeyRepository`

3. **Create Services**
   - `ApplicationService`
   - `ConfigService`
   - `AdminKeyService`
   - `EventService`

4. **Create Database Factory**
   - `DatabaseFactory.js`

5. **Refactor API Handlers**
   - Inject services/repositories
   - Keep endpoints focused on HTTP layer only

6. **Update Database Schema**
   - Create new tables (admin_keys, admin_events)

7. **Add Frontend Features**
   - Success alert on apply.html
   - Event/maintenance display on home page
   - Admin key management UI (no UI changes, just additions)

8. **Testing**
   - Test each service independently
   - Test API endpoints with mocked services

---

## Files to Create/Modify

### New Files
- `api/_lib/repositories/ApplicationRepository.js`
- `api/_lib/repositories/ConfigRepository.js`
- `api/_lib/repositories/AdminKeyRepository.js`
- `api/_lib/services/ApplicationService.js`
- `api/_lib/services/ConfigService.js`
- `api/_lib/services/AdminKeyService.js`
- `api/_lib/services/EventService.js`
- `api/_lib/factory/DatabaseFactory.js`
- `api/admin/keys.js` (new endpoint for admin key management)
- `api/admin/events.js` (new endpoint for event management)
- `migrations/create_admin_tables.sql`

### Modified Files
- `api/applications/index.js` - Use ApplicationService
- `api/applications/[id].js` - Use ApplicationService
- `api/config.js` - Use ConfigService
- `public/apply.html` - Add success alert
- `public/admin.html` - Add event/maintenance tabs

---

## Benefits of This Refactoring

✅ **Testability**: Mock services and repositories  
✅ **Maintainability**: Clear separation of concerns  
✅ **Extensibility**: Add new backends without modifying existing code  
✅ **Reusability**: Services can be used across multiple endpoints  
✅ **Clarity**: Business logic is explicit and not mixed with HTTP logic  
✅ **Flexibility**: Easily swap implementations (Supabase → Firestore)


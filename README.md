# Secure Task Management System

A full-stack task management application with role-based access control (RBAC), built with NestJS, Angular, and NX monorepo.

## Features

- JWT-based authentication
- Role-based access control (Owner, Admin, Viewer)
- Organization hierarchy (2-level)
- Drag-and-drop kanban board
- Task completion visualization
- Dark/light mode
- Keyboard shortcuts
- Audit logging
- Responsive design
- Unit tests (Jest)

---

## Prerequisites

- Node.js v18+ or Bun
- npm/bun
- SQLite (included)

---

## Setup Instructions

### 1. Clone & Install
```bash
git clone [<repository-url>](https://github.com/ltthanh95/tle-b461dc38-0b42-4dff-b844-afcac271abd3.git)
cd tle-b461dc38-0b42-4dff-b844-afcac271abd3
npm install
# or
bun install
```

### 2. Environment Setup

change `.env.sample` to `.env` or create `.env` file in root:
```env
# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production

# Database (SQLite - no config needed)
# File will be created at: root folder => database.sqlite

# API Port
PORT=3000
```

### 3. Seed Database
```bash
npm run seed
```

This creates:
- 3 roles (Owner, Admin, Viewer) with permissions
- 2 organizations (Company A → Team B)
- 3 test users (one per role)

**Test Accounts:**
- `owner@company.com` / `password123` (Owner in Company A)
- `admin@company.com` / `password123` (Admin in Company A)
- `viewer@company.com` / `password123` (Viewer in Team B)

### 4. Run Applications

**Option A: Run separately (recommended)**
```bash
# Terminal 1 - Backend
nx serve api

# Terminal 2 - Frontend
nx serve dashboard
```

**Option B: Run both together**
```bash
nx run-many --target=serve --projects=api,dashboard --parallel
```

**Access:**
- Frontend: http://localhost:4200
- Backend: http://localhost:3000

### 5. Run Tests
```bash
# Backend tests
nx test api

# Frontend tests
nx test dashboard

# All tests
nx run-many --target=test --all
```

---

## 🏗️ Architecture Overview

### NX Monorepo Structure
```
tle-b461dc38-0b42-4dff-b844-afcac271abd3/
├── apps/
│   ├── api/                    # NestJS backend
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/       # Authentication (JWT)
│   │       │   ├── user/      # User management
│   │       │   ├── org/  # Org hierarchy
│   │       │   ├── role/      # Role management
│   │       │   ├── permission/    # Permission system
│   │       │   ├── task/      # Task CRUD + RBAC
│   │       │   └── audit-log/  # Audit logging
│   │       └── app.module.ts
│   │
│   └── dashboard/              # Angular frontend
│       └── src/
│           └── app/
│               ├── core/       # Services, guards, models
│               │   ├── services/
│               │   ├── guards/
│               │   ├── interceptors/
│               │   └── models/
│               └── features/   # Feature modules
│                   ├── auth/
│                   └── dashboard/
```

### Why NX Monorepo?

1. **Code Sharing**: Shared TypeScript interfaces between frontend/backend
2. **Unified Tooling**: Single test runner, linter, build system
3. **Dependency Management**: Centralized package management
4. **Developer Experience**: Run both apps with one command
5. **Scalability**: Easy to add microservices, libraries, or apps


---

## Data Model

### Entity Relationship Diagram

<img width="1308" height="959" alt="image" src="https://github.com/user-attachments/assets/69c01dd0-171a-4a3e-95eb-f53d75a71a8a" />




### Schema Details

**Users**
- Belongs to one Organization
- Has one Role
- Can create multiple Tasks
- Password hashed with bcrypt (salt rounds: 10)

**Organizations**
- 2-level hierarchy (parent → child)
- Self-referencing `parentId` foreign key
- Example: "Company A" → "Team B"

**Roles**
- Three predefined: Owner, Admin, Viewer
- Has many Permissions

**Permissions**
- Granular access control
- Format: `resource` + `action`
- Examples: 
  - `task:create`, `task:read`, `task:update`, `task:delete`
  - `audit-log:read`
  - `user:create`, `user:read`

**Tasks**
- Belongs to User (creator)
- Belongs to Organization
- Status: `pending`, `in-progress`, `completed`
- Category: `Work`, `Personal`

**AuditLog**
- Immutable log of all actions
- Captures: who, what, when, where, how
- Used for compliance and debugging

---

## Access Control Implementation

### Role Hierarchy & Permissions
```typescript
Owner {
  task: [create, read, update, delete]
  user: [create, read, update, delete]
  audit-log: [read]
  scope: own org + all child orgs
}

Admin {
  task: [create, read, update, delete]
  user: [read]
  audit-log: [read]
  scope: own org only
}

Viewer {
  task: [read]
  user: [read]
  scope: own org only
}
```

### Organization Hierarchy
```
Company A (Owner sees everything)
├── Owner: sees Company A + Team B tasks
└── Team B (Admin/Viewer limited)
    ├── Admin: sees only Team B tasks
    └── Viewer: sees only Team B tasks
```

### RBAC Flow

1. **User logs in** → JWT token issued with `userId`, `roleId`, `organizationId`
2. **Request made** → JWT token attached to headers
3. **JWT Guard** → Validates token, extracts user info
4. **RBAC Guard** → Checks permissions:
   - Verifies role has required permission (`@RequirePermissions('task', 'create')`)
   - Loads accessible org IDs (user's org + child orgs for Owners)
5. **Service Layer** → Filters data by accessible org IDs
6. **Response** → Only authorized data returned

### JWT Integration

**Token Structure:**
```json
{
  "sub": "user-id",
  "email": "owner@company.com",
  "roleId": "role-id",
  "organizationId": "org-id",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token Lifecycle:**
- Expires: 24 hours
- Stored: localStorage (frontend)
- Transmitted: `Authorization: Bearer <token>` header
- Validated: Every protected request

**Security Measures:**
- Passwords hashed with bcrypt
- JWT signed with secret key
- CORS enabled
- Input validation with class-validator
- SQL injection prevention with TypeORM

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication

#### POST /auth/register
Register new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "roleId": "role-uuid",
  "organizationId": "org-uuid"
}
```

**Response:**
```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "roleId": "role-uuid",
  "organizationId": "org-uuid"
}
```

#### POST /auth/login
Login user

**Request:**
```json
{
  "email": "owner@company.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "email": "owner@company.com",
    "name": "Owner User",
    "role": {
      "id": "role-uuid",
      "name": "Owner"
    },
    "organization": {
      "id": "org-uuid",
      "name": "Company A"
    }
  }
}
```

#### GET /auth/profile
Get current user (protected)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "userId": "user-uuid",
  "email": "owner@company.com",
  "roleId": "role-uuid",
  "organizationId": "org-uuid"
}
```

---

### Tasks

#### POST /tasks
Create task (requires `task:create` permission)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Implement feature X",
  "description": "Add new functionality",
  "status": "pending",
  "category": "Work"
}
```

**Response:**
```json
{
  "id": "task-uuid",
  "title": "Implement feature X",
  "description": "Add new functionality",
  "status": "pending",
  "category": "Work",
  "userId": "user-uuid",
  "organizationId": "org-uuid",
  "createdAt": "2024-01-12T10:00:00Z",
  "updatedAt": "2024-01-12T10:00:00Z"
}
```

#### GET /tasks
List accessible tasks (scoped by role/org)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "task-uuid",
    "title": "Task 1",
    "status": "pending",
    "user": {
      "name": "Owner User",
      "email": "owner@company.com"
    },
    "organization": {
      "name": "Company A"
    }
  }
]
```

#### GET /tasks/:id
Get single task

#### PUT /tasks/:id
Update task (requires `task:update` permission)

**Request:**
```json
{
  "status": "completed"
}
```

#### DELETE /tasks/:id
Delete task (requires `task:delete` permission)

#### GET /tasks/by-category?category=Work
Filter tasks by category

#### GET /tasks/by-status?status=completed
Filter tasks by status

---

### Audit Log

#### GET /audit-log
View audit logs (Owner/Admin only)

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `userId` - filter by user
- `resource` - filter by resource (task, user, etc)
- `action` - filter by action (CREATE, READ, UPDATE, DELETE)

**Response:**
```json
[
  {
    "id": "log-uuid",
    "userId": "user-uuid",
    "userEmail": "owner@company.com",
    "action": "CREATE",
    "resource": "task",
    "resourceId": "task-uuid",
    "method": "POST",
    "endpoint": "/api/tasks",
    "ipAddress": "127.0.0.1",
    "createdAt": "2024-01-12T10:00:00Z"
  }
]
```

---

### Error Responses

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "invalid credentials"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "insufficient permissions"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "task not found or access denied"
}
```

---

## Future Considerations

### Advanced Features

1. **Role Delegation**
   - Allow Owners to create custom roles
   - Fine-grained permission assignment
   - Role templates for common use cases

2. **Multi-tenancy**
   - Support multiple companies in one instance
   - Tenant isolation at database level
   - Per-tenant configuration

3. **Real-time Collaboration**
   - WebSocket integration for live updates
   - See who's viewing/editing tasks
   - Collaborative editing with conflict resolution

4. **Advanced Filtering**
   - Save custom filters
   - Complex query builder
   - Bulk operations

### Production Security Enhancements

1. **JWT Refresh Tokens**
```typescript
   // Current: 24h access token
   // Future: 15min access + 7d refresh
   {
     access_token: "short-lived-token",
     refresh_token: "long-lived-token"
   }
```
   - Rotate refresh tokens on use
   - Store refresh tokens in database
   - Revocation list for compromised tokens

2. **CSRF Protection**
   - Add CSRF tokens for state-changing operations
   - SameSite cookie policy
   - Double-submit cookie pattern

3. **Rate Limiting**
```typescript
   @UseGuards(ThrottlerGuard)
   @Throttle(10, 60) // 10 requests per 60 seconds
```

4. **RBAC Caching**
   - Cache permission checks in Redis
   - Invalidate on role/permission changes
   - Reduce database queries by 80%

### Scalability Improvements

1. **Database Optimization**
   - Add indexes: `organizationId`, `userId`, `status`
   - Implement pagination for large datasets
   - Database connection pooling
   - Consider PostgreSQL for production

2. **Permission Check Optimization**
```typescript
   // Current: Query on every request
   // Future: In-memory cache with TTL
   
   @Cacheable('permissions', 300) // 5 min TTL
   async checkPermission(roleId, resource, action) {
     // ...
   }
```

3. **Microservices Architecture**
   - Split auth service
   - Separate task service
   - Independent scaling
   - Message queue (RabbitMQ/Kafka)

4. **CDN & Asset Optimization**
   - Serve frontend from CDN
   - Image optimization
   - Code splitting
   - Lazy loading

### Monitoring & Observability

1. **Logging**
   - Structured logging (Winston/Pino)
   - Log aggregation (ELK/Datadog)
   - Error tracking (Sentry)

2. **Metrics**
   - API response times
   - Database query performance
   - Cache hit rates
   - User activity analytics

3. **Health Checks**
```typescript
   GET /health
   {
     status: "ok",
     database: "connected",
     memory: "512MB/2GB"
   }
```

### Testing Improvements

1. **Integration Tests**
   - End-to-end API tests
   - Database transaction rollback
   - Test fixtures and factories

2. **E2E Tests**
   - Cypress/Playwright
   - Critical user flows
   - Visual regression testing

3. **Load Testing**
   - Artillery/k6
   - Stress test with 1000+ concurrent users
   - Performance benchmarks

---

## Testing

### Backend Tests
```bash
nx test api

# Coverage
nx test api --coverage
```

**Test Coverage:**
- Auth Service (login, register, JWT)
- RBAC Guard (permission checks)
- Tasks Controller (CRUD endpoints)
- Tasks Service (business logic)

### Frontend Tests
```bash
nx test dashboard

# Coverage
nx test dashboard --coverage
```

**Test Coverage:**
- Auth Service (HTTP calls, token management)
- Task Service (CRUD operations)
- Login Component (form validation, submission)
- Dashboard Component (filters, CRUD, dark mode)

---

##  Troubleshooting

### Database Issues
```bash
# Reset database
rm apps/api/database.sqlite
nx serve api  # will recreate
npm run seed  # reseed data
```

### Port Conflicts
```bash
# Change backend port
PORT=3001 nx serve api

# Change frontend port
nx serve dashboard --port 4201
```

### CORS Errors
Ensure `app.enableCors()` is in `apps/api/src/main.ts`

### Tailwind Not Loading
```bash
nx reset  # clear cache
nx serve dashboard
```

---

##  Development Notes

### Code Style
- Backend: NestJS conventions
- Frontend: Angular style guide
- Formatting: Prettier
- Linting: ESLint


### Commit Convention
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `test:` add tests
- `refactor:` code refactoring

---

## 👥 Contributors

- Thanh Le - Full Stack Developer

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

- NestJS framework
- Angular framework
- NX build system
- Tailwind CSS
- TypeORM

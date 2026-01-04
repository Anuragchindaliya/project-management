# 🚀 Advanced Project Management Platform

A full-stack project management application built with modern technologies, featuring real-time collaboration, role-based access control, and comprehensive task management.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Real-time Events](#real-time-events)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)

---

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MySQL 8.0 (Amazon Lightsail)
- **ORM**: Drizzle ORM
- **Authentication**: JWT (HttpOnly cookies)
- **Real-time**: Socket.io
- **Validation**: Zod

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Real-time**: Socket.io Client

### DevOps

- **Containerization**: Docker & Docker Compose
- **Database Admin**: Adminer
- **Cache**: Redis (for Socket.io scaling)

---

## ✨ Features

### Core Functionality

- ✅ **Multi-Workspace Support** - Organize projects across different workspaces
- ✅ **Hierarchical Projects** - Workspace → Projects → Tasks
- ✅ **Advanced Task Management** - Status tracking, priorities, assignments, subtasks
- ✅ **Real-time Collaboration** - Live updates across all connected clients
- ✅ **Activity Audit Trail** - Complete history of all changes
- ✅ **Comments & Attachments** - Rich task discussions

### Security & Permissions

- 🔐 **JWT Authentication** - Secure HttpOnly cookie-based auth
- 🔐 **Role-Based Access Control (RBAC)** - Workspace and Project level permissions
- 🔐 **Permission Hierarchy** - Owner > Admin > Member > Viewer

### Real-time Features

- ⚡ **Live Task Updates** - See changes instantly
- ⚡ **User Presence** - Know who's online and viewing tasks
- ⚡ **Typing Indicators** - See when users are commenting
- ⚡ **Instant Notifications** - Real-time task assignments

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │   TanStack   │  │  Socket.io   │  │  Tailwind CSS   │  │
│  │    Query     │  │    Client    │  │   Components    │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS / WSS
┌───────────────────────┴─────────────────────────────────────┐
│                    API LAYER (Express)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│  │   Routes   │→ │Controllers │→ │     Middleware     │   │
│  │            │  │            │  │  (Auth, RBAC, Zod)  │   │
│  └────────────┘  └────────────┘  └────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Services (Workspace, Project, Task, RBAC, Auth)    │   │
│  └─────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────────┐
│                     DATA ACCESS LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Drizzle ORM  │  │  Socket.io   │  │  Activity Logs  │  │
│  │   (MySQL)    │  │   Emitters   │  │   (Audit)       │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd project-management-platform
```

### 2. Server Setup

```bash
cd server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 3. Start Development Environment

```bash
# Start MySQL and Adminer
docker-compose up -d

# Wait for MySQL to be ready (about 10 seconds)

# Generate Drizzle migrations
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with demo data
npm run db:seed

# Start development server
npm run dev
```

Server will start on `http://localhost:3000`

### 4. Client Setup

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

Client will start on `http://localhost:5173`

---

## 💾 Database Setup

### Environment Variables

```env
# server/.env
NODE_ENV=development
PORT=3000
CLIENT_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=pm_user
DB_PASSWORD=pm_password_change_me
DB_NAME=project_management

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Redis (Optional - for Socket.io scaling)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Drizzle Commands

```bash
# Generate migrations from schema
npm run db:generate

# Push schema to database (no migration files)
npm run db:push

# Open Drizzle Studio (visual database editor)
npm run db:studio

# Seed database with demo data
npm run db:seed

# Drop all tables (caution!)
npm run db:drop
```

### Database Access

**Adminer UI**: http://localhost:8080

- System: MySQL
- Server: mysql
- Username: pm_user
- Password: pm_password_change_me
- Database: project_management

**Drizzle Studio**: Run `npm run db:studio`

---

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/v1/auth/register      # Create new user
POST   /api/v1/auth/login         # Login user
POST   /api/v1/auth/refresh       # Refresh access token
POST   /api/v1/auth/logout        # Logout user
GET    /api/v1/auth/me            # Get current user
```

### Workspace Endpoints

```
POST   /api/v1/workspaces                    # Create workspace
GET    /api/v1/workspaces                    # Get user workspaces
GET    /api/v1/workspaces/:id                # Get workspace details
PATCH  /api/v1/workspaces/:id                # Update workspace
GET    /api/v1/workspaces/:id/members        # Get workspace members
POST   /api/v1/workspaces/:id/members        # Add member
PATCH  /api/v1/workspaces/:id/members/:uid   # Update member role
DELETE /api/v1/workspaces/:id/members/:uid   # Remove member
```

### Project Endpoints

```
POST   /api/v1/projects                      # Create project
GET    /api/v1/projects/workspace/:wid       # Get workspace projects
GET    /api/v1/projects/:id                  # Get project details
PATCH  /api/v1/projects/:id                  # Update project
DELETE /api/v1/projects/:id                  # Delete project
GET    /api/v1/projects/:id/members          # Get project members
POST   /api/v1/projects/:id/members          # Add member
```

### Task Endpoints

```
POST   /api/v1/tasks/projects/:pid/tasks     # Create task
GET    /api/v1/tasks/projects/:pid/tasks     # Get project tasks
GET    /api/v1/tasks/tasks/:id               # Get task details
PATCH  /api/v1/tasks/tasks/:id               # Update task
DELETE /api/v1/tasks/tasks/:id               # Delete task
PATCH  /api/v1/tasks/tasks/bulk-update       # Bulk update tasks
GET    /api/v1/tasks/my-tasks                # Get user's tasks
GET    /api/v1/tasks/projects/:pid/stats     # Get project statistics
```

### Example API Request

```typescript
// Login
const response = await fetch("http://localhost:3000/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include", // Important for cookies
  body: JSON.stringify({
    email: "john.doe@example.com",
    password: "Password123!",
  }),
});

const data = await response.json();
// HttpOnly cookies automatically set
```

---

## ⚡ Real-time Events

### Socket.io Connection

```typescript
import io from "socket.io-client";

const socket = io("http://localhost:3000", {
  auth: {
    token: accessToken, // JWT token
  },
});

socket.on("connect", () => {
  console.log("Connected to server");
});
```

### Event Types

#### Workspace Events

- `join_workspace` - Join workspace room
- `leave_workspace` - Leave workspace room
- `workspace_updated` - Workspace details changed
- `user_joined_workspace` - User joined workspace
- `user_left_workspace` - User left workspace

#### Project Events

- `join_project` - Join project room
- `leave_project` - Leave project room
- `project_joined` - Confirmation with active users
- `project_updated` - Project details changed
- `user_joined_project` - User joined project
- `user_left_project` - User left project

#### Task Events

- `task_created` - New task created
- `task_updated` - Task modified
- `task_deleted` - Task removed
- `tasks_bulk_updated` - Multiple tasks updated
- `task_assigned` - Task assigned to user
- `viewing_task` - User viewing specific task
- `stop_viewing_task` - User stopped viewing
- `typing_comment` - User typing comment
- `stopped_typing_comment` - User stopped typing

#### Usage Example

```typescript
// Join project room
socket.emit("join_project", { projectId: "xxx-xxx-xxx" });

// Listen for task updates
socket.on("task_updated", (data) => {
  console.log("Task updated:", data.task);
  // Update UI
  queryClient.invalidateQueries(["tasks", data.task.projectId]);
});

// Listen for new tasks
socket.on("task_created", (data) => {
  console.log("New task:", data.task);
  // Update UI
});
```

---

## 🔧 Development Workflow

### Project Structure Review

```
server/src/
├── api/
│   ├── routes/          # Express routes
│   └── controllers/     # Request handlers
├── services/            # Business logic
├── db/
│   ├── schema.ts        # Drizzle schema
│   ├── connection.ts    # DB connection
│   ├── migrations/      # Migration files
│   └── seed.ts          # Seed data
├── middleware/          # Express middleware
├── validators/          # Zod schemas
├── socket/              # Socket.io handlers
├── types/               # TypeScript types
└── utils/               # Helper functions
```

### Development Commands

```bash
# Backend
npm run dev              # Start with nodemon
npm run build            # Compile TypeScript
npm run start            # Run production build
npm run db:generate      # Generate migrations
npm run db:push          # Push schema
npm run db:studio        # Visual DB editor
npm run db:seed          # Seed database

# Frontend
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run preview          # Preview production build
```

### Testing the System

1. **Start Services**

```bash
docker-compose up -d
cd server && npm run dev
cd client && npm run dev
```

2. **Seed Database**

```bash
cd server && npm run db:seed
```

3. **Login Credentials** (from seed data)

   - Email: `john.doe@example.com`
   - Password: `Password123!`

4. **Test Real-time**
   - Open two browser windows
   - Login with different users
   - Join same project
   - Create/update tasks and see real-time updates

---

## 🎯 Key Implementation Patterns

### Service Layer Pattern

```typescript
// Services contain business logic
class TaskService {
  async updateTask(taskId, data, userId) {
    return await db.transaction(async (tx) => {
      // 1. Validate permissions
      // 2. Update database
      // 3. Log activity
      // 4. Emit real-time event
    });
  }
}
```

### RBAC Middleware Usage

```typescript
// Require minimum role
router.patch(
  "/:id",
  authenticate,
  requireWorkspaceAccess("admin"),
  controller.update
);

// Require specific permission
router.delete(
  "/:id",
  authenticate,
  requireWorkspacePermission("canDeleteProjects"),
  controller.delete
);
```

### Transaction Pattern

```typescript
// Always use transactions for critical operations
await db.transaction(async (tx) => {
  await tx.delete(tasks).where(eq(tasks.projectId, projectId));
  await tx
    .delete(projectMembers)
    .where(eq(projectMembers.projectId, projectId));
  await tx.delete(projects).where(eq(projects.id, projectId));
});
```

---

## 🚢 Deployment

### Production Checklist

- [ ] Change all default passwords in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database backups
- [ ] Configure Redis for Socket.io (for multiple instances)
- [ ] Set up monitoring and logging
- [ ] Use environment-specific `.env` files

### Amazon Lightsail MySQL Setup

1. Create MySQL database instance
2. Note connection details
3. Update `.env` with production credentials
4. Run migrations: `npm run db:push`
5. Seed initial data if needed

---

## 📖 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev)

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙋‍♂️ Support

For issues and questions:

- Create an issue in GitHub
- Email: support@example.com

**Built with ❤️ using modern TypeScript stack**

# ⚡ Quick Start Guide - Project Management Platform

## 🎯 5-Minute Setup

### Step 1: Clone and Install (2 minutes)

```bash
# Clone repository
git clone <your-repo-url>
cd project-management-platform

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Start Docker Services (1 minute)

```bash
# From project root
docker-compose up -d

# Verify services are running
docker-compose ps

# Expected output:
# pm_platform_mysql   - Up
# pm_platform_adminer - Up
# pm_platform_redis   - Up
```

### Step 3: Setup Database (1 minute)

```bash
cd server

# Copy environment file
cp .env.example .env

# Generate and push schema
npm run db:generate
npm run db:push

# Seed demo data
npm run db:seed
```

### Step 4: Start Development Servers (1 minute)

```bash
# Terminal 1 - Backend
cd server
npm run dev
# Server running on http://localhost:3000

# Terminal 2 - Frontend
cd client
npm run dev
# Client running on http://localhost:5173
```

---

## 🧪 Test the System

### Login with Demo Account

Navigate to `http://localhost:5173/login`

```
Email: john.doe@example.com
Password: Password123!
```

### Test Real-time Features

1. Open two browser windows
2. Login with different demo accounts:
   - Window 1: `john.doe@example.com`
   - Window 2: `jane.smith@example.com`
3. Both join "Acme Corporation" workspace
4. Navigate to "Website Redesign" project
5. Create/update tasks in one window
6. Watch real-time updates in the other window ✨

---

## 📋 Available Demo Data

After running `npm run db:seed`:

### Users (all with password `Password123!`)

- **john.doe@example.com** - Workspace Owner
- **jane.smith@example.com** - Workspace Admin
- **bob.wilson@example.com** - Member
- **alice.brown@example.com** - Viewer

### Workspaces

- **Acme Corporation** - 4 members, 2 projects
- **Tech Startup Inc** - 2 members, 1 project

### Projects with Tasks

- **Website Redesign (WEB)** - 4 tasks
- **Mobile App Development (MOBILE)** - 3 tasks
- **API Backend (API)** - 2 tasks

---

## 🔧 Essential Commands Reference

### Docker Commands

```bash
docker-compose up -d          # Start all services
docker-compose down           # Stop all services
docker-compose logs mysql     # View MySQL logs
docker-compose restart mysql  # Restart MySQL
```

### Database Commands

```bash
npm run db:generate           # Generate migrations
npm run db:push              # Push schema to DB
npm run db:studio            # Open visual DB editor
npm run db:seed              # Seed demo data
npm run db:drop              # Drop all tables (careful!)
```

### Development Commands

```bash
# Backend
npm run dev                  # Start with hot reload
npm run build                # Build for production
npm run start                # Start production build

# Frontend
npm run dev                  # Start dev server
npm run build                # Build for production
npm run preview              # Preview production build
```

---

## 🎨 Access Admin Tools

### Adminer (Database GUI)

URL: `http://localhost:8080`

```
System: MySQL
Server: mysql
Username: pm_user
Password: pm_password_change_me
Database: project_management
```

### Drizzle Studio (Visual ORM Editor)

```bash
cd server
npm run db:studio
```

Opens at `https://local.drizzle.studio`

---

## 🧪 Test API with cURL

### 1. Register User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }' \
  -c cookies.txt
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Password123!"
  }' \
  -c cookies.txt
```

### 3. Get Current User

```bash
curl http://localhost:3000/api/v1/auth/me \
  -b cookies.txt
```

### 4. Get Workspaces

```bash
curl http://localhost:3000/api/v1/workspaces \
  -b cookies.txt
```

### 5. Create Task

```bash
curl -X POST http://localhost:3000/api/v1/tasks/projects/{PROJECT_ID}/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "projectId": "your-project-id",
    "title": "New task via API",
    "description": "Created using cURL",
    "priority": "high",
    "status": "todo"
  }'
```

---

## 🐛 Common Issues & Solutions

### Issue: "Port 3306 already in use"

**Solution:** Another MySQL instance is running

```bash
# Stop local MySQL
sudo service mysql stop
# Or change port in docker-compose.yml
ports:
  - "3307:3306"  # Use 3307 on host
```

### Issue: "Cannot connect to database"

**Solution:** Wait for MySQL to fully start

```bash
# Check MySQL is ready
docker-compose logs mysql | grep "ready for connections"
# Should see this twice
```

### Issue: "CORS error in browser"

**Solution:** Check CLIENT_URL in server/.env

```env
CLIENT_URL=http://localhost:5173
```

### Issue: "JWT token expired immediately"

**Solution:** Check system time is correct

```bash
date  # Verify system time
```

### Issue: "Socket.io not connecting"

**Solution:** Check WebSocket URL

```typescript
// client/src/hooks/useSocket.ts
const SOCKET_URL = "http://localhost:3000"; // No /api/v1
```

---

## 📊 Database Schema Overview

```
users
  ├── workspaces (owner)
  │   ├── workspace_members
  │   └── projects
  │       ├── project_members
  │       └── tasks
  │           ├── task_comments
  │           └── task_attachments
  └── activity_logs
```

### Key Relationships

- **1 User → Many Workspaces** (as member)
- **1 Workspace → Many Projects**
- **1 Project → Many Tasks**
- **1 Task → Many Comments & Attachments**
- **Tasks can have Parent Tasks** (subtasks)

---

## 🎯 Next Steps After Setup

### 1. Explore the Codebase

Start with these key files:

```
server/src/
├── db/schema.ts              # Database structure
├── services/task.service.ts  # Business logic example
├── middleware/rbac.middleware.ts  # Authorization
└── socket/handlers.ts        # Real-time events

client/src/
├── api/queries/              # TanStack Query hooks
├── hooks/useSocket.ts        # WebSocket integration
└── components/               # React components
```

### 2. Create Your First Feature

**Example: Add Task Priority Filter**

1. **Backend** - Add query parameter:

```typescript
// server/src/services/task.service.ts
async getTasksByProject(projectId: string, userId: string, priority?: string) {
  const conditions = [eq(tasks.projectId, projectId)];
  if (priority) {
    conditions.push(eq(tasks.priority, priority));
  }
  return await db.select().from(tasks).where(and(...conditions));
}
```

2. **Frontend** - Use the filter:

```typescript
// client/src/components/TaskList.tsx
const { data: tasks } = useTasks(projectId, { priority: "high" });
```

### 3. Add Custom Validations

```typescript
// server/src/validators/task.validator.ts
export const createTaskSchema = z.object({
  body: z.object({
    // Add custom validation
    dueDate: z
      .string()
      .datetime()
      .refine((date) => new Date(date) > new Date(), {
        message: "Due date must be in the future",
      }),
  }),
});
```

### 4. Implement New Real-time Events

```typescript
// server/src/socket/handlers.ts
socket.on("task_comment_added", async (data) => {
  // Emit to all users viewing the task
  io.to(`task:${data.taskId}`).emit("comment_added", {
    comment: data.comment,
    user: socket.data.username,
  });
});
```

---

## 📚 Learn More

### Key Concepts to Understand

1. **Drizzle ORM**

   - Schema definition with TypeScript
   - Type-safe queries
   - Migrations and schema changes

2. **RBAC System**

   - Workspace roles: Owner > Admin > Member > Viewer
   - Project roles: Lead > Developer > Viewer
   - Permission hierarchy and checks

3. **Real-time Architecture**

   - Socket.io rooms for workspaces/projects
   - Event emission patterns
   - Optimistic UI updates

4. **TanStack Query**
   - Query invalidation strategies
   - Mutation side effects
   - Cache management

---

## 🚀 Production Deployment Checklist

Before deploying to production:

- [ ] Change all passwords and secrets in `.env`
- [ ] Set `NODE_ENV=production`
- [ ] Use 32+ character JWT secrets
- [ ] Enable HTTPS
- [ ] Set up database backups
- [ ] Configure Redis for Socket.io scaling
- [ ] Set up monitoring (e.g., Sentry, DataDog)
- [ ] Configure rate limiting
- [ ] Set up CI/CD pipeline
- [ ] Test error scenarios
- [ ] Load test the application

---

## 💡 Pro Tips

1. **Use Drizzle Studio** for quick schema exploration
2. **Monitor Socket.io connections** in browser DevTools → Network → WS
3. **Use React Query DevTools** to debug cache issues
4. **Check Adminer** to verify database changes
5. **Test RBAC** by creating users with different roles
6. **Use `console.log` in Socket handlers** to debug real-time events

---

## 🆘 Need Help?

1. Check the [Complete README](./README.md)
2. Review error logs: `docker-compose logs -f`
3. Verify all services are running: `docker-compose ps`
4. Check database connection: `npm run db:studio`
5. Test API endpoints with Postman or cURL
6. Join our Discord/Slack (if available)

---

**🎉 You're all set! Happy coding!**

Start building your project management empire! 🚀

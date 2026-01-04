# Complete Folder Structure

```
/project-management-platform
├── /client                           # Frontend Application
│   ├── /src
│   │   ├── /api                      # TanStack Query hooks & API client
│   │   │   ├── /queries              # Query hooks (GET operations)
│   │   │   ├── /mutations            # Mutation hooks (POST/PUT/DELETE)
│   │   │   └── client.ts             # Axios instance with interceptors
│   │   ├── /components
│   │   │   ├── /ui                   # Reusable UI components
│   │   │   ├── /workspace            # Workspace-specific components
│   │   │   ├── /project              # Project-specific components
│   │   │   ├── /task                 # Task components (Kanban, List)
│   │   │   └── /auth                 # Login, Register forms
│   │   ├── /hooks                    # Custom React hooks
│   │   ├── /layouts                  # Page layouts
│   │   ├── /pages                    # Route pages
│   │   ├── /stores                   # Zustand/Context stores
│   │   ├── /types                    # TypeScript types
│   │   ├── /utils                    # Helper functions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.local
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── /server                           # Backend Application
│   ├── /src
│   │   ├── /api                      # HTTP Layer
│   │   │   ├── /routes               # Express routes
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── workspace.routes.ts
│   │   │   │   ├── project.routes.ts
│   │   │   │   ├── task.routes.ts
│   │   │   │   └── index.ts          # Route aggregator
│   │   │   └── /controllers          # Route handlers
│   │   │       ├── auth.controller.ts
│   │   │       ├── workspace.controller.ts
│   │   │       ├── project.controller.ts
│   │   │       └── task.controller.ts
│   │   │
│   │   ├── /services                 # Business Logic Layer
│   │   │   ├── auth.service.ts       # JWT, password hashing
│   │   │   ├── workspace.service.ts  # Workspace CRUD + RBAC
│   │   │   ├── project.service.ts    # Project CRUD + permissions
│   │   │   ├── task.service.ts       # Task CRUD + real-time
│   │   │   └── rbac.service.ts       # Permission checking logic
│   │   │
│   │   ├── /db                       # Database Layer
│   │   │   ├── /migrations           # Drizzle migrations
│   │   │   ├── schema.ts             # Drizzle schema definitions
│   │   │   ├── connection.ts         # Database connection pool
│   │   │   └── seed.ts               # Seed data for development
│   │   │
│   │   ├── /middleware               # Express Middleware
│   │   │   ├── auth.middleware.ts    # JWT verification
│   │   │   ├── rbac.middleware.ts    # Role/permission checks
│   │   │   ├── validate.middleware.ts # Zod validation
│   │   │   ├── errorHandler.ts       # Global error handler
│   │   │   └── rateLimiter.ts        # Rate limiting
│   │   │
│   │   ├── /types                    # TypeScript Types
│   │   │   ├── express.d.ts          # Express type extensions
│   │   │   ├── jwt.types.ts
│   │   │   └── shared.types.ts
│   │   │
│   │   ├── /utils                    # Utility Functions
│   │   │   ├── jwt.util.ts
│   │   │   ├── password.util.ts
│   │   │   └── response.util.ts
│   │   │
│   │   ├── /validators               # Zod Schemas
│   │   │   ├── auth.validator.ts
│   │   │   ├── workspace.validator.ts
│   │   │   ├── project.validator.ts
│   │   │   └── task.validator.ts
│   │   │
│   │   ├── /socket                   # Socket.io Logic
│   │   │   ├── handlers.ts           # Socket event handlers
│   │   │   └── index.ts              # Socket.io setup
│   │   │
│   │   ├── app.ts                    # Express app configuration
│   │   └── index.ts                  # Entry point
│   │
│   ├── .env
│   ├── .env.example
│   ├── drizzle.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
│
├── docker-compose.yml                # Local development setup
├── .gitignore
├── README.md
└── package.json                      # Root workspace (optional)
```

## Key Architecture Decisions

### 1. **Separation of Concerns**

- **Controllers**: Handle HTTP requests/responses only
- **Services**: Contain business logic and orchestration
- **Repositories**: Database operations (implicit in Drizzle queries)

### 2. **Scalability Considerations**

- Routes and controllers separated for easy splitting into microservices
- Socket.io handlers isolated for potential Redis adapter integration
- Service layer can be extracted to separate packages

### 3. **Security Layers**

- Authentication middleware (JWT validation)
- RBAC middleware (permission checks)
- Request validation (Zod schemas)
- Rate limiting to prevent abuse

### 4. **Type Safety**

- Shared types between client/server
- Drizzle provides end-to-end type safety
- Zod validators double as type generators

### 5. **Development Experience**

- Hot reload with nodemon (server)
- Vite HMR (client)
- Docker for consistent local environment
- Migrations for version-controlled schema changes

# Project Management Platform - Frontend

React frontend built with Vite, TypeScript, Tailwind CSS, and Shadcn/UI.

## Architecture

### Feature-Sliced Design (FSD)

The project follows Feature-Sliced Design architecture:

```
src/
├── app/              # App initialization, providers, routing
│   └── providers/    # React context providers (QueryClient, Auth)
├── pages/            # Full page components (routes)
├── widgets/          # Complex UI blocks composed of features
├── features/         # User interactions and business features
├── entities/         # Business entities (Project, Task, User)
│   └── project/
│       └── api/      # API service and TanStack Query hooks
└── shared/           # Reusable infrastructure code
    ├── api/          # Central axios client
    ├── types/        # Shared TypeScript types (from Drizzle)
    ├── store/        # Zustand stores (UI state)
    └── hooks/        # Shared React hooks (useSocket)
```

### Type Safety

Types are imported directly from the backend Drizzle schema using `InferSelectModel` and `InferInsertModel`, ensuring 100% type safety between frontend and backend.

**Location:** `src/shared/types/drizzle.types.ts`

These types are re-exported from `server/src/db/types.ts`, which uses Drizzle's type inference.

### State Management

- **TanStack Query v5**: All server state (fetching/mutating data)
- **Zustand**: Local UI state (sidebar toggle, active project ID, etc.)

**Stores:**
- `src/shared/store/auth.store.ts` - Authentication state
- `src/shared/store/ui.store.ts` - UI state (sidebar, active selections)

### API Client

Central axios instance configured with:
- `withCredentials: true` for JWT cookies
- Base URL: `/api/v1`
- Error handling interceptors

**Location:** `src/shared/api/client.ts`

### Real-time Updates

Socket.io integration via `useSocket` hook that:
- Connects to the backend socket server
- Listens for events (project:created, task:updated, etc.)
- Automatically invalidates TanStack Query cache to refresh UI

**Location:** `src/shared/hooks/useSocket.ts`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. The app will run on `http://localhost:5173`

## Usage Examples

### Using Projects API

```tsx
import { useWorkspaceProjects, useCreateProject } from '@/entities/project/api/useProjects';

function ProjectsList({ workspaceId }: { workspaceId: string }) {
  const { data: projects, isLoading } = useWorkspaceProjects(workspaceId);
  const createProject = useCreateProject();

  const handleCreate = () => {
    createProject.mutate({
      workspaceId,
      name: 'New Project',
      key: 'PROJ',
      description: 'Project description',
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {projects?.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
      <button onClick={handleCreate}>Create Project</button>
    </div>
  );
}
```

### Using UI Store

```tsx
import { useUIStore } from '@/shared/store/ui.store';

function Sidebar() {
  const { sidebarOpen, toggleSidebar, activeProjectId } = useUIStore();

  return (
    <div className={sidebarOpen ? 'open' : 'closed'}>
      <button onClick={toggleSidebar}>Toggle</button>
      {activeProjectId && <div>Active: {activeProjectId}</div>}
    </div>
  );
}
```

## Environment Variables

Create a `.env` file in the client root:

```env
VITE_SOCKET_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
```

## Next Steps

1. Install and configure Shadcn/UI components
2. Set up React Router for navigation
3. Create authentication pages (login, register)
4. Build out feature components using the established patterns

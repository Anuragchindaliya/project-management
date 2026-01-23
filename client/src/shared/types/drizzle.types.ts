/**
 * Shared types for Drizzle Schema
 * Copied from server schema to avoid build issues with direct relative imports outside of src
 */

export type Role = 'owner' | 'admin' | 'member' | 'viewer';
export type ProjectRole = 'lead' | 'developer' | 'viewer';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  isActive: 'active' | 'inactive';
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ownerId: string;
  avatarUrl: string | null;
  isActive: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}
export interface WorkspaceWithRole {
    workspace: Workspace;
    role: Role;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  joinedAt: Date;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description: string | null;
  ownerId: string;
  status: 'active' | 'archived' | 'completed';
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectRole;
  addedAt: Date;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  taskNumber: number;
  status: 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId: string | null;
  reporterId: string;
  parentTaskId: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations often attached
  assignee?: User;
  reporter?: User;
  comments?: TaskComment[];
}

export interface TaskResponse {
    task: Task;
    assignee: User | null;
}

const data = [
    {
        "task": {
            "id": "29dda509-d53c-4d23-a224-270b188d887d",
            "projectId": "9f028316-e867-4cf0-8576-4eca59d6680f",
            "title": "Initial setup",
            "description": "Make the initial setup with necessary dependencies",
            "taskNumber": 1,
            "status": "todo",
            "priority": "medium",
            "assigneeId": null,
            "reporterId": "e15e95ee-55dc-4eeb-a110-16db740abd39",
            "parentTaskId": null,
            "estimatedHours": null,
            "actualHours": null,
            "dueDate": null,
            "completedAt": null,
            "createdAt": "2026-01-23T13:52:36.000Z",
            "updatedAt": "2026-01-23T13:52:36.000Z"
        },
        "assignee": null
    }
]

export interface TaskComment {
    id: string;
    content: string;
    taskId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    user?: User;
}

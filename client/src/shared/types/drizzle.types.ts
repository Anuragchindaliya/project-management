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
const data = [
    {
        "workspace": {
            "id": "02754ea0-c890-4e24-a414-178b2b05ce97",
            "name": "Department of telecommunication",
            "slug": "dot",
            "description": "DOT is for helping the indian goverment telecom infrastructure all action from permissions to make that project functional to manage in single platform",
            "ownerId": "e15e95ee-55dc-4eeb-a110-16db740abd39",
            "avatarUrl": null,
            "isActive": "active",
            "createdAt": "2026-01-23T12:20:25.000Z",
            "updatedAt": "2026-01-23T12:20:25.000Z"
        },
        "role": "owner"
    }
]

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
}

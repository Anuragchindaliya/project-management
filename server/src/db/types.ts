/**
 * Type exports for frontend consumption
 * Uses Drizzle's InferSelectModel and InferInsertModel for type safety
 */

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import {
  users,
  workspaces,
  workspaceMembers,
  projects,
  projectMembers,
  tasks,
  taskComments,
  taskAttachments,
  activityLogs,
} from './schema';

// User types
export type User = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;

// Workspace types
export type Workspace = InferSelectModel<typeof workspaces>;
export type WorkspaceInsert = InferInsertModel<typeof workspaces>;

// Workspace Member types
export type WorkspaceMember = InferSelectModel<typeof workspaceMembers>;
export type WorkspaceMemberInsert = InferInsertModel<typeof workspaceMembers>;

// Project types
export type Project = InferSelectModel<typeof projects>;
export type ProjectInsert = InferInsertModel<typeof projects>;

// Project Member types
export type ProjectMember = InferSelectModel<typeof projectMembers>;
export type ProjectMemberInsert = InferInsertModel<typeof projectMembers>;

// Task types
export type Task = InferSelectModel<typeof tasks>;
export type TaskInsert = InferInsertModel<typeof tasks>;

// Task Comment types
export type TaskComment = InferSelectModel<typeof taskComments>;
export type TaskCommentInsert = InferInsertModel<typeof taskComments>;

// Task Attachment types
export type TaskAttachment = InferSelectModel<typeof taskAttachments>;
export type TaskAttachmentInsert = InferInsertModel<typeof taskAttachments>;

// Activity Log types
export type ActivityLog = InferSelectModel<typeof activityLogs>;
export type ActivityLogInsert = InferInsertModel<typeof activityLogs>;

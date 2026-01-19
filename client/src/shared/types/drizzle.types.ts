/**
 * Shared types imported directly from backend Drizzle schema
 * This ensures 100% type safety between frontend and backend
 * 
 * These types are re-exported from the server's type definitions
 * which use InferSelectModel and InferInsertModel from Drizzle ORM
 */

// Re-export types from server
export type {
  User,
  UserInsert,
  Workspace,
  WorkspaceInsert,
  WorkspaceMember,
  WorkspaceMemberInsert,
  Project,
  ProjectInsert,
  ProjectMember,
  ProjectMemberInsert,
  Task,
  TaskInsert,
  TaskComment,
  TaskCommentInsert,
  TaskAttachment,
  TaskAttachmentInsert,
  ActivityLog,
  ActivityLogInsert,
} from '../../../../server/src/db/types';

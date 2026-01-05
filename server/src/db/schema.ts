import { relations } from 'drizzle-orm';
import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

export interface Task {
  id: number;
  name: string;
  completed: boolean;
  projectId: string;
}

// ============================================
// USERS TABLE
// ============================================
export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 50 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    avatarUrl: text('avatar_url'),
    isActive: mysqlEnum('is_active', ['active', 'inactive']).default('active').notNull(),
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    emailIdx: index('email_idx').on(table.email),
    usernameIdx: index('username_idx').on(table.username),
  })
);

// ============================================
// WORKSPACES TABLE
// ============================================
export const workspaces = mysqlTable(
  'workspaces',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    description: text('description'),
    ownerId: varchar('owner_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    avatarUrl: text('avatar_url'),
    isActive: mysqlEnum('is_active', ['active', 'archived']).default('active').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex('slug_idx').on(table.slug),
    ownerIdx: index('owner_idx').on(table.ownerId),
  })
);

// ============================================
// WORKSPACE MEMBERS (RBAC)
// ============================================
export const workspaceMembers = mysqlTable(
  'workspace_members',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: varchar('workspace_id', { length: 36 })
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: mysqlEnum('role', ['owner', 'admin', 'member', 'viewer']).notNull(),
    invitedBy: varchar('invited_by', { length: 36 }).references(() => users.id),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => ({
    workspaceUserIdx: uniqueIndex('workspace_user_idx').on(table.workspaceId, table.userId),
    userIdx: index('user_idx').on(table.userId),
  })
);

// ============================================
// PROJECTS TABLE
// ============================================
export const projects = mysqlTable(
  'projects',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: varchar('workspace_id', { length: 36 })
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 100 }).notNull(),
    key: varchar('key', { length: 10 }).notNull(), // e.g., "PROJ" for PROJ-123
    description: text('description'),
    ownerId: varchar('owner_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    status: mysqlEnum('status', ['active', 'archived', 'completed']).default('active').notNull(),
    startDate: timestamp('start_date'),
    endDate: timestamp('end_date'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    workspaceKeyIdx: uniqueIndex('workspace_key_idx').on(table.workspaceId, table.key),
    workspaceIdx: index('workspace_idx').on(table.workspaceId),
    ownerIdx: index('owner_idx').on(table.ownerId),
  })
);

// ============================================
// PROJECT MEMBERS (RBAC at Project Level)
// ============================================
export const projectMembers = mysqlTable(
  'project_members',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: varchar('project_id', { length: 36 })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: mysqlEnum('role', ['lead', 'developer', 'viewer']).notNull(),
    addedAt: timestamp('added_at').defaultNow().notNull(),
  },
  (table) => ({
    projectUserIdx: uniqueIndex('project_user_idx').on(table.projectId, table.userId),
    userIdx: index('user_idx').on(table.userId),
  })
);

// ============================================
// TASKS TABLE
// ============================================
export const tasks: any = mysqlTable(
  'tasks',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    projectId: varchar('project_id', { length: 36 })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    taskNumber: int('task_number').notNull(), // Auto-incremented per project
    status: mysqlEnum('status', ['todo', 'in_progress', 'in_review', 'done', 'blocked'])
      .default('todo')
      .notNull(),
    priority: mysqlEnum('priority', ['low', 'medium', 'high', 'urgent'])
      .default('medium')
      .notNull(),
    assigneeId: varchar('assignee_id', { length: 36 }).references(() => users.id, {
      onDelete: 'set null',
    }),
    reporterId: varchar('reporter_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    parentTaskId: varchar('parent_task_id', { length: 36 }).references(() => tasks.id, {
      onDelete: 'set null',
    }), // For subtasks
    estimatedHours: int('estimated_hours'),
    actualHours: int('actual_hours'),
    dueDate: timestamp('due_date'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    projectNumberIdx: uniqueIndex('project_number_idx').on(table.projectId, table.taskNumber),
    projectIdx: index('project_idx').on(table.projectId),
    assigneeIdx: index('assignee_idx').on(table.assigneeId),
    statusIdx: index('status_idx').on(table.status),
    parentTaskIdx: index('parent_task_idx').on(table.parentTaskId),
  })
);

// ============================================
// TASK COMMENTS
// ============================================
export const taskComments = mysqlTable(
  'task_comments',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    taskId: varchar('task_id', { length: 36 })
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    taskIdx: index('task_idx').on(table.taskId),
    userIdx: index('user_idx').on(table.userId),
  })
);

// ============================================
// TASK ATTACHMENTS
// ============================================
export const taskAttachments = mysqlTable(
  'task_attachments',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    taskId: varchar('task_id', { length: 36 })
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    uploadedBy: varchar('uploaded_by', { length: 36 })
      .notNull()
      .references(() => users.id),
    fileName: varchar('file_name', { length: 255 }).notNull(),
    fileUrl: text('file_url').notNull(),
    fileSize: int('file_size'), // in bytes
    mimeType: varchar('mime_type', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    taskIdx: index('task_idx').on(table.taskId),
  })
);

// ============================================
// ACTIVITY LOGS (Audit Trail)
// ============================================
export const activityLogs = mysqlTable(
  'activity_logs',
  {
    id: varchar('id', { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    workspaceId: varchar('workspace_id', { length: 36 }).references(() => workspaces.id, {
      onDelete: 'cascade',
    }),
    projectId: varchar('project_id', { length: 36 }).references(() => projects.id, {
      onDelete: 'cascade',
    }),
    taskId: varchar('task_id', { length: 36 }).references(() => tasks.id, {
      onDelete: 'cascade',
    }),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    action: varchar('action', { length: 50 }).notNull(), // e.g., "task_created", "task_updated"
    entityType: mysqlEnum('entity_type', ['workspace', 'project', 'task', 'comment']).notNull(),
    metadata: text('metadata'), // JSON string for additional data
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    workspaceIdx: index('workspace_idx').on(table.workspaceId),
    projectIdx: index('project_idx').on(table.projectId),
    taskIdx: index('task_idx').on(table.taskId),
    userIdx: index('user_idx').on(table.userId),
    createdAtIdx: index('created_at_idx').on(table.createdAt),
  })
);

// ============================================
// RELATIONS (Drizzle ORM)
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  ownedWorkspaces: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
  ownedProjects: many(projects),
  projectMemberships: many(projectMembers),
  assignedTasks: many(tasks, { relationName: 'assignee' }),
  reportedTasks: many(tasks, { relationName: 'reporter' }),
  comments: many(taskComments),
  activityLogs: many(activityLogs),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  members: many(workspaceMembers),
  projects: many(projects),
  activityLogs: many(activityLogs),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceMembers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, {
    fields: [workspaceMembers.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, {
    fields: [projects.workspaceId],
    references: [workspaces.id],
  }),
  owner: one(users, {
    fields: [projects.ownerId],
    references: [users.id],
  }),
  members: many(projectMembers),
  tasks: many(tasks),
  activityLogs: many(activityLogs),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
  project: one(projects, {
    fields: [projectMembers.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [projectMembers.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: 'assignee',
  }),
  reporter: one(users, {
    fields: [tasks.reporterId],
    references: [users.id],
    relationName: 'reporter',
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: 'subtasks',
  }),
  subtasks: many(tasks, { relationName: 'subtasks' }),
  comments: many(taskComments),
  attachments: many(taskAttachments),
  activityLogs: many(activityLogs),
}));

export const taskCommentsRelations = relations(taskComments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskComments.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [taskComments.userId],
    references: [users.id],
  }),
}));

export const taskAttachmentsRelations = relations(taskAttachments, ({ one }) => ({
  task: one(tasks, {
    fields: [taskAttachments.taskId],
    references: [tasks.id],
  }),
  uploader: one(users, {
    fields: [taskAttachments.uploadedBy],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [activityLogs.workspaceId],
    references: [workspaces.id],
  }),
  project: one(projects, {
    fields: [activityLogs.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [activityLogs.taskId],
    references: [tasks.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

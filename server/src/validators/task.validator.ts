import z from "zod";

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Task title is required")
      .max(255, "Task title must not exceed 255 characters")
      .trim(),
    description: z
      .string()
      .max(5000, "Description must not exceed 5000 characters")
      .optional(),
    status: z
      .enum(["todo", "in_progress", "in_review", "done", "blocked"], {
        error: () => ({
          message:
            "Status must be one of: todo, in_progress, in_review, done, blocked",
        }),
      })
      .default("todo")
      .optional(),
    priority: z
      .enum(["low", "medium", "high", "urgent"], {
        error: () => ({
          message: "Priority must be one of: low, medium, high, urgent",
        }),
      })
      .default("medium")
      .optional(),
    assigneeId: z
      .string()
      .uuid("Invalid assignee ID format")
      .optional()
      .nullable(),
    parentTaskId: z
      .string()
      .uuid("Invalid parent task ID format")
      .optional()
      .nullable(),
    estimatedHours: z
      .number()
      .int("Estimated hours must be an integer")
      .min(0, "Estimated hours cannot be negative")
      .max(1000, "Estimated hours cannot exceed 1000")
      .optional()
      .nullable(),
    dueDate: z
      .string()
      .datetime("Invalid date format. Use ISO 8601 format")
      .transform((val) => new Date(val))
      .refine((date) => date > new Date(), {
        message: "Due date must be in the future",
      })
      .optional()
      .nullable(),
  }),
  params: z.object({
    projectId: z.string().uuid("Invalid project ID format"),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Task title cannot be empty")
      .max(255, "Task title must not exceed 255 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(5000, "Description must not exceed 5000 characters")
      .optional()
      .nullable(),
    status: z
      .enum(["todo", "in_progress", "in_review", "done", "blocked"], {
        error: () => ({
          message:
            "Status must be one of: todo, in_progress, in_review, done, blocked",
        }),
      })
      .optional(),
    priority: z
      .enum(["low", "medium", "high", "urgent"], {
        error: () => ({
          message: "Priority must be one of: low, medium, high, urgent",
        }),
      })
      .optional(),
    assigneeId: z
      .string()
      .uuid("Invalid assignee ID format")
      .nullable()
      .optional(),
    estimatedHours: z
      .number()
      .int("Estimated hours must be an integer")
      .min(0, "Estimated hours cannot be negative")
      .max(1000, "Estimated hours cannot exceed 1000")
      .nullable()
      .optional(),
    actualHours: z
      .number()
      .int("Actual hours must be an integer")
      .min(0, "Actual hours cannot be negative")
      .max(1000, "Actual hours cannot exceed 1000")
      .nullable()
      .optional(),
    dueDate: z
      .string()
      .datetime("Invalid date format. Use ISO 8601 format")
      .transform((val) => new Date(val))
      .nullable()
      .optional(),
    parentTaskId: z
      .string()
      .uuid("Invalid parent task ID format")
      .nullable()
      .optional(),
  }),
  params: z.object({
    taskId: z.string().uuid("Invalid task ID format"),
  }),
});

export const bulkUpdateTasksSchema = z.object({
  body: z.object({
    updates: z
      .array(
        z.object({
          taskId: z.string().uuid("Invalid task ID format"),
          status: z.enum(
            ["todo", "in_progress", "in_review", "done", "blocked"],
            {
              error: () => ({
                message:
                  "Status must be one of: todo, in_progress, in_review, done, blocked",
              }),
            }
          ),
          position: z
            .number()
            .int("Position must be an integer")
            .min(0, "Position cannot be negative")
            .optional(),
        })
      )
      .min(1, "At least one task update is required")
      .max(50, "Cannot update more than 50 tasks at once"),
  }),
});

export const getTaskSchema = z.object({
  params: z.object({
    taskId: z.string().uuid("Invalid task ID format"),
  }),
});

export const getProjectTasksSchema = z.object({
  params: z.object({
    projectId: z.string().uuid("Invalid project ID format"),
  }),
  query: z
    .object({
      status: z
        .enum(["todo", "in_progress", "in_review", "done", "blocked"])
        .optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      assigneeId: z.string().uuid().optional(),
    })
    .optional(),
});

export const deleteTaskSchema = z.object({
  params: z.object({
    taskId: z.string().uuid("Invalid task ID format"),
  }),
});

import z from "zod";

export const createProjectSchema = z.object({
  body: z
    .object({
      workspaceId: z.string().uuid("Invalid workspace ID format"),
      name: z
        .string()
        .min(1, "Project name is required")
        .max(100, "Project name must not exceed 100 characters")
        .trim(),
      key: z
        .string()
        .min(2, "Project key must be at least 2 characters")
        .max(10, "Project key must not exceed 10 characters")
        .regex(
          /^[A-Z0-9]+$/,
          "Project key must contain only uppercase letters and numbers"
        )
        .transform((val) => val.toUpperCase()),
      description: z
        .string()
        .max(2000, "Description must not exceed 2000 characters")
        .optional(),
      startDate: z
        .string()
        .datetime("Invalid date format. Use ISO 8601 format")
        .transform((val) => new Date(val))
        .optional(),
      endDate: z
        .string()
        .datetime("Invalid date format. Use ISO 8601 format")
        .transform((val) => new Date(val))
        .optional(),
    })
    .refine(
      (data) => {
        if (data.startDate && data.endDate) {
          return data.endDate > data.startDate;
        }
        return true;
      },
      {
        message: "End date must be after start date",
        path: ["endDate"],
      }
    ),
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Project name cannot be empty")
      .max(100, "Project name must not exceed 100 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(2000, "Description must not exceed 2000 characters")
      .optional()
      .nullable(),
    status: z
      .enum(["active", "archived", "completed"], {
        error: () => ({
          message: "Status must be one of: active, archived, completed",
        }),
      })
      .optional(),
    startDate: z
      .string()
      .datetime("Invalid date format")
      .transform((val) => new Date(val))
      .nullable()
      .optional(),
    endDate: z
      .string()
      .datetime("Invalid date format")
      .transform((val) => new Date(val))
      .nullable()
      .optional(),
  }),
  params: z.object({
    projectId: z.string().uuid("Invalid project ID format"),
  }),
});

export const addProjectMemberSchema = z.object({
  body: z.object({
    userId: z.string().uuid("Invalid user ID format"),
    role: z.enum(["lead", "developer", "viewer"], {
      error: () => ({
        message: "Role must be one of: lead, developer, viewer",
      }),
    }),
  }),
  params: z.object({
    projectId: z.string().uuid("Invalid project ID format"),
  }),
});

export const updateProjectMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(["lead", "developer", "viewer"], {
      error: () => ({
        message: "Role must be one of: lead, developer, viewer",
      }),
    }),
  }),
  params: z.object({
    projectId: z.string().uuid("Invalid project ID format"),
    userId: z.string().uuid("Invalid user ID format"),
  }),
});

export const removeProjectMemberSchema = z.object({
  params: z.object({
    projectId: z.string().uuid("Invalid project ID format"),
    userId: z.string().uuid("Invalid user ID format"),
  }),
});

export const getProjectSchema = z.object({
  params: z.object({
    projectId: z.string().uuid("Invalid project ID format"),
  }),
});

export const getWorkspaceProjectsSchema = z.object({
  params: z.object({
    workspaceId: z.string().uuid("Invalid workspace ID format"),
  }),
});

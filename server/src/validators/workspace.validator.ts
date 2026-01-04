import { z } from "zod";

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Workspace name is required")
      .max(100, "Workspace name must not exceed 100 characters")
      .trim(),
    slug: z
      .string()
      .min(3, "Slug must be at least 3 characters")
      .max(100, "Slug must not exceed 100 characters")
      .regex(
        /^[a-z0-9-]+$/,
        "Slug can only contain lowercase letters, numbers, and hyphens"
      )
      .refine((slug) => !slug.startsWith("-") && !slug.endsWith("-"), {
        message: "Slug cannot start or end with a hyphen",
      }),
    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .optional(),
    avatarUrl: z
      .string()
      .url("Invalid avatar URL")
      .optional()
      .or(z.literal("")),
  }),
});

export const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Workspace name cannot be empty")
      .max(100, "Workspace name must not exceed 100 characters")
      .trim()
      .optional(),
    description: z
      .string()
      .max(1000, "Description must not exceed 1000 characters")
      .optional()
      .nullable(),
    avatarUrl: z.string().url("Invalid avatar URL").optional().nullable(),
    isActive: z
      .enum(["active", "archived"], {
        error: () => ({
          message: "Status must be either active or archived",
        }),
      })
      .optional(),
  }),
  params: z.object({
    workspaceId: z.string().uuid("Invalid workspace ID format"),
  }),
});

export const addWorkspaceMemberSchema = z.object({
  body: z.object({
    userId: z.string().uuid("Invalid user ID format"),
    role: z.enum(["owner", "admin", "member", "viewer"], {
      error: () => ({
        message: "Role must be one of: owner, admin, member, viewer",
      }),
    }),
  }),
  params: z.object({
    workspaceId: z.string().uuid("Invalid workspace ID format"),
  }),
});

export const updateWorkspaceMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(["admin", "member", "viewer"], {
      error: () => ({
        message: "Role must be one of: admin, member, viewer",
      }),
    }),
  }),
  params: z.object({
    workspaceId: z.string().uuid("Invalid workspace ID format"),
    userId: z.string().uuid("Invalid user ID format"),
  }),
});

export const removeWorkspaceMemberSchema = z.object({
  params: z.object({
    workspaceId: z.string().uuid("Invalid workspace ID format"),
    userId: z.string().uuid("Invalid user ID format"),
  }),
});

export const getWorkspaceSchema = z.object({
  params: z.object({
    workspaceId: z.string().uuid("Invalid workspace ID format"),
  }),
});

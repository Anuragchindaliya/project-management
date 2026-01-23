import z from "zod";

export const createCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Comment content is required")
      .max(2000, "Comment must not exceed 2000 characters")
      .trim(),
  }),
  params: z.object({
    taskId: z.string().uuid("Invalid task ID format"),
  }),
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Comment content cannot be empty")
      .max(2000, "Comment must not exceed 2000 characters")
      .trim(),
  }),
  params: z.object({
    commentId: z.string().uuid("Invalid comment ID format"),
  }),
});

export const deleteCommentSchema = z.object({
  params: z.object({
    commentId: z.string().uuid("Invalid comment ID format"),
  }),
});

export const getTaskCommentsSchema = z.object({
  params: z.object({
    taskId: z.string().uuid("Invalid task ID format"),
  }),
});

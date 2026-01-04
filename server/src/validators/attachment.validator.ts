import z from "zod";

export const createAttachmentSchema = z.object({
  body: z.object({
    taskId: z.string().uuid("Invalid task ID format"),
    fileName: z
      .string()
      .min(1, "File name is required")
      .max(255, "File name must not exceed 255 characters"),
    fileUrl: z.string().url("Invalid file URL"),
    fileSize: z
      .number()
      .int("File size must be an integer")
      .min(1, "File size must be at least 1 byte")
      .max(50 * 1024 * 1024, "File size cannot exceed 50MB"), // 50MB limit
    mimeType: z
      .string()
      .regex(/^[a-z]+\/[a-z0-9\-\+\.]+$/i, "Invalid MIME type format")
      .optional(),
  }),
  params: z.object({
    taskId: z.string().uuid("Invalid task ID format"),
  }),
});

export const deleteAttachmentSchema = z.object({
  params: z.object({
    attachmentId: z.string().uuid("Invalid attachment ID format"),
  }),
});

export const getTaskAttachmentsSchema = z.object({
  params: z.object({
    taskId: z.string().uuid("Invalid task ID format"),
  }),
});

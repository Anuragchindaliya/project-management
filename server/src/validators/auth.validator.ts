import z from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").toLowerCase().trim(),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must not exceed 50 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      )
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must not exceed 100 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character"
      ),
    firstName: z
      .string()
      .max(100, "First name must not exceed 100 characters")
      .trim()
      .optional(),
    lastName: z
      .string()
      .max(100, "Last name must not exceed 100 characters")
      .trim()
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").toLowerCase().trim(),
    password: z.string().min(1, "Password is required"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({}).optional(),
});

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .max(100, "First name must not exceed 100 characters")
      .trim()
      .optional(),
    lastName: z
      .string()
      .max(100, "Last name must not exceed 100 characters")
      .trim()
      .optional(),
    avatarUrl: z.string().url("Invalid avatar URL").optional().nullable(),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters")
        .max(100, "New password must not exceed 100 characters")
        .regex(
          /[A-Z]/,
          "New password must contain at least one uppercase letter"
        )
        .regex(
          /[a-z]/,
          "New password must contain at least one lowercase letter"
        )
        .regex(/[0-9]/, "New password must contain at least one number")
        .regex(
          /[!@#$%^&*(),.?":{}|<>]/,
          "New password must contain at least one special character"
        ),
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: "New password must be different from current password",
      path: ["newPassword"],
    }),
});

import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "pm_user",
    password: process.env.DB_PASSWORD || "pm_password_change_me",
    database: process.env.DB_NAME || "project_management",
  },
} satisfies Config;

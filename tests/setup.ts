import { config as loadEnv } from "dotenv";

// Load local env before any module reads process.env (e.g. the Prisma client
// singleton reads DATABASE_URL at construction time).
loadEnv({ path: ".env.local" });
loadEnv();

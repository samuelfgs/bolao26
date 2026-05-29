import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("WARNING: DATABASE_URL is not set. Database operations will fail.");
}

const client = connectionString ? postgres(connectionString, {
  ssl: 'require',
  prepare: false,
  connect_timeout: 10,
  max: 1,
}) : null;

export const db = client ? drizzle(client, { schema }) : new Proxy({} as any, {
  get(_, prop) {
    const errorMsg = `Database connection failed: DATABASE_URL is missing or invalid. Attempted to access: ${String(prop)}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
});

export { schema };
export * from "./schema";

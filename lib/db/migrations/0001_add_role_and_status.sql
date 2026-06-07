ALTER TABLE "users" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;
ALTER TABLE "users_to_pools" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;

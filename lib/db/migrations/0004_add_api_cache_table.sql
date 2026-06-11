CREATE TABLE "api_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"data" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_cache_key_unique" UNIQUE("key")
);

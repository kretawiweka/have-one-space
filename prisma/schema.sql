-- ==========================================
-- have-one-space database schema
-- PostgreSQL compatible (Supabase, Railway, etc.)
-- ==========================================

-- Enable required extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- User table
-- Stores admin users for CMS authentication
-- ==========================================
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "User_email_key" UNIQUE ("email")
);

-- Comment on User table
COMMENT ON TABLE "User" IS 'Admin users for CMS authentication';
COMMENT ON COLUMN "User"."id" IS 'Unique identifier (CUID/UUID)';
COMMENT ON COLUMN "User"."email" IS 'Login email address';
COMMENT ON COLUMN "User"."password" IS 'Bcrypt hashed password';
COMMENT ON COLUMN "User"."name" IS 'Display name';
COMMENT ON COLUMN "User"."createdAt" IS 'Account creation timestamp';
COMMENT ON COLUMN "User"."updatedAt" IS 'Last update timestamp';

-- ==========================================
-- Post table
-- Stores blog posts with MDX content
-- ==========================================
CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT '{}',
    "summary" TEXT,
    "draft" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Post_slug_key" UNIQUE ("slug")
);

-- Comment on Post table
COMMENT ON TABLE "Post" IS 'Blog posts with MDX content';
COMMENT ON COLUMN "Post"."id" IS 'Unique identifier (CUID/UUID)';
COMMENT ON COLUMN "Post"."title" IS 'Post title';
COMMENT ON COLUMN "Post"."slug" IS 'URL-friendly identifier (unique)';
COMMENT ON COLUMN "Post"."content" IS 'MDX content';
COMMENT ON COLUMN "Post"."tags" IS 'Array of tags (e.g., {javascript, nextjs})';
COMMENT ON COLUMN "Post"."summary" IS 'Short description for list view';
COMMENT ON COLUMN "Post"."draft" IS 'true = draft, false = published';
COMMENT ON COLUMN "Post"."publishedAt" IS 'Publication date (null = draft)';
COMMENT ON COLUMN "Post"."createdAt" IS 'Creation timestamp';
COMMENT ON COLUMN "Post"."updatedAt" IS 'Last update timestamp';

-- ==========================================
-- Indexes for performance
-- ==========================================

-- Index on Post slug for fast lookups
CREATE INDEX IF NOT EXISTS "Post_slug_idx" ON "Post"("slug");

-- Index on Post draft status for filtering published/draft posts
CREATE INDEX IF NOT EXISTS "Post_draft_idx" ON "Post"("draft");

-- Index on Post publishedAt for sorting by date
CREATE INDEX IF NOT EXISTS "Post_publishedAt_idx" ON "Post"("publishedAt" DESC);

-- Index on User email for fast login lookups
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");

-- ==========================================
-- Trigger function for auto-updating updatedAt
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to User table
CREATE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Attach trigger to Post table
CREATE TRIGGER update_post_updated_at
    BEFORE UPDATE ON "Post"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- Optional: Insert a sample post for testing
-- ==========================================
-- Uncomment below to insert a sample post:

-- INSERT INTO "Post" ("id", "title", "slug", "content", "tags", "summary", "draft", "publishedAt")
-- VALUES (
--     gen_random_uuid()::TEXT,
--     'Hello World',
--     'hello-world',
--     '# Hello World\n\nThis is my first post.',
--     ARRAY['hello', 'world'],
--     'My first blog post',
--     false,
--     CURRENT_TIMESTAMP
-- );

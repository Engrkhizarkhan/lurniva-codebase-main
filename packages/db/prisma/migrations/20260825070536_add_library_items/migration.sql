-- CreateTable
CREATE TABLE "library_items" (
    "id" BIGSERIAL NOT NULL,
    "user_id" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'personal',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'raw',
    "source_type" TEXT NOT NULL DEFAULT 'text',
    "file_name" TEXT,
    "source_text" TEXT,
    "skill" JSONB,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "library_items_user_id_idx" ON "library_items"("user_id");

-- CreateIndex
CREATE INDEX "library_items_scope_idx" ON "library_items"("scope");

-- AddForeignKey
ALTER TABLE "library_items" ADD CONSTRAINT "library_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
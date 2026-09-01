-- CreateTable
CREATE TABLE "teachers" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "bio" TEXT,
    "avatar_url" TEXT,
    "subjects" TEXT[],
    "monthly_fee" INTEGER NOT NULL,
    "availability" TEXT NOT NULL DEFAULT 'available',
    "rating" DECIMAL(2,1),
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "teachers_is_published_name_id_idx" ON "teachers"("is_published", "name", "id");

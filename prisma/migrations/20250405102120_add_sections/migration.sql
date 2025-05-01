/*
  Warnings:

  - Added the required column `sectionId` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_courseId_fkey";

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- Create default sections for existing courses
INSERT INTO "Section" ("title", "order", "updatedAt", "courseId")
SELECT 'Default Section', 1, NOW(), "id" FROM "Course";

-- Add sectionId column with NULL constraint temporarily
ALTER TABLE "Lesson" ADD COLUMN "sectionId" INTEGER;

-- Update existing lessons to use the default section
UPDATE "Lesson" l
SET "sectionId" = s.id
FROM "Section" s
WHERE l."courseId" = s."courseId";

-- Now make sectionId NOT NULL
ALTER TABLE "Lesson" ALTER COLUMN "sectionId" SET NOT NULL;

-- Make courseId nullable
ALTER TABLE "Lesson" ALTER COLUMN "courseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

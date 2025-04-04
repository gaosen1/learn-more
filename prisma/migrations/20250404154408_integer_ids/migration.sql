/*
  Warnings:

  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Lesson` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Lesson` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UserCourse` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `UserCourse` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `authorId` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `courseId` on the `Lesson` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `userId` on the `UserCourse` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `courseId` on the `UserCourse` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_courseId_fkey";

-- DropForeignKey
ALTER TABLE "UserCourse" DROP CONSTRAINT "UserCourse_courseId_fkey";

-- DropForeignKey
ALTER TABLE "UserCourse" DROP CONSTRAINT "UserCourse_userId_fkey";

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "authorId",
ADD COLUMN     "authorId" INTEGER NOT NULL,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "courseId",
ADD COLUMN     "courseId" INTEGER NOT NULL,
ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserCourse" DROP CONSTRAINT "UserCourse_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" INTEGER NOT NULL,
DROP COLUMN "courseId",
ADD COLUMN     "courseId" INTEGER NOT NULL,
ADD CONSTRAINT "UserCourse_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "UserCourse_userId_courseId_key" ON "UserCourse"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourse" ADD CONSTRAINT "UserCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourse" ADD CONSTRAINT "UserCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

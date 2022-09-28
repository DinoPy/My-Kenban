/*
  Warnings:

  - Added the required column `updatedAt` to the `UserSchema` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserSchema" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_UserSchema" ("email", "id", "password", "username") SELECT "email", "id", "password", "username" FROM "UserSchema";
DROP TABLE "UserSchema";
ALTER TABLE "new_UserSchema" RENAME TO "UserSchema";
CREATE UNIQUE INDEX "UserSchema_email_key" ON "UserSchema"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

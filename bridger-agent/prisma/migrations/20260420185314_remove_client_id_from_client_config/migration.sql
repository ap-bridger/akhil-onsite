/*
  Warnings:

  - You are about to drop the column `client_id` on the `ClientConfig` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClientConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "config" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    CONSTRAINT "ClientConfig_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "BankAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ClientConfig" ("bank_account_id", "config", "id") SELECT "bank_account_id", "config", "id" FROM "ClientConfig";
DROP TABLE "ClientConfig";
ALTER TABLE "new_ClientConfig" RENAME TO "ClientConfig";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

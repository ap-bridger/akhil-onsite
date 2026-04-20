/*
  Warnings:

  - Added the required column `transaction_date` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "details" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "transaction_date" DATETIME NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "categorization_id" TEXT,
    CONSTRAINT "Transaction_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "BankAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categorization_id_fkey" FOREIGN KEY ("categorization_id") REFERENCES "Categorization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "bank_account_id", "categorization_id", "details", "id") SELECT "amount", "bank_account_id", "categorization_id", "details", "id" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_categorization_id_key" ON "Transaction"("categorization_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

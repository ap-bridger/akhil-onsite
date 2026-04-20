-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    CONSTRAINT "BankAccount_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "details" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "categorization_id" TEXT,
    CONSTRAINT "Transaction_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "BankAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categorization_id_fkey" FOREIGN KEY ("categorization_id") REFERENCES "Categorization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Categorization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reason" TEXT NOT NULL,
    "ai_generated" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "confidence_score" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payee_id" TEXT,
    "category_id" TEXT,
    "transaction_id" TEXT NOT NULL,
    CONSTRAINT "Categorization_payee_id_fkey" FOREIGN KEY ("payee_id") REFERENCES "Vendor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Categorization_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Categorization_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "Transaction" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "config" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    CONSTRAINT "ClientConfig_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClientConfig_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "BankAccount" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_account_number_key" ON "BankAccount"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_categorization_id_key" ON "Transaction"("categorization_id");

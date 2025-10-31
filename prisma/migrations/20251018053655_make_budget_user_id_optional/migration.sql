-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "folio" TEXT NOT NULL,
    "userId" TEXT,
    "clientId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT,
    "concepts" JSONB NOT NULL,
    "subtotal" REAL NOT NULL,
    "ivaPercentage" REAL NOT NULL DEFAULT 16,
    "ivaAmount" REAL NOT NULL,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Budget_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Recipient" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Budget_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Budget_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Budget" ("clientId", "concepts", "createdAt", "date", "description", "folio", "id", "ivaAmount", "ivaPercentage", "recipientId", "status", "subtotal", "total", "updatedAt", "userId") SELECT "clientId", "concepts", "createdAt", "date", "description", "folio", "id", "ivaAmount", "ivaPercentage", "recipientId", "status", "subtotal", "total", "updatedAt", "userId" FROM "Budget";
DROP TABLE "Budget";
ALTER TABLE "new_Budget" RENAME TO "Budget";
CREATE UNIQUE INDEX "Budget_folio_key" ON "Budget"("folio");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "budget_id" UUID;

-- CreateIndex
CREATE INDEX "idx_transactions_budget" ON "transactions"("budget_id");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "household_summary_totals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "household_id" UUID NOT NULL,
    "total_income" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_expense" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "total_balance_carry_over" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "last_carry_over_at" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "household_summary_totals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "household_summary_totals_household_id_key" ON "household_summary_totals"("household_id");

-- AddForeignKey
ALTER TABLE "household_summary_totals" ADD CONSTRAINT "household_summary_totals_household_id_fkey" FOREIGN KEY ("household_id") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

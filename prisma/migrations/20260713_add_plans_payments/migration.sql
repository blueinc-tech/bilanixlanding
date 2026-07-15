-- CreateTable: Subscription Plans
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "interval" TEXT NOT NULL DEFAULT 'monthly',
    "features" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Payment Logs
CREATE TABLE "payment_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "subscription_id" TEXT,
    "plan_slug" TEXT,
    "gateway" TEXT,
    "gateway_ref" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "type" TEXT NOT NULL DEFAULT 'subscription',
    "description" TEXT,
    "metadata" JSONB,
    "paid_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_plans_slug_key" ON "subscription_plans"("slug");
CREATE INDEX "subscription_plans_is_active_idx" ON "subscription_plans"("is_active");
CREATE INDEX "subscription_plans_sort_order_idx" ON "subscription_plans"("sort_order");

CREATE INDEX "payment_logs_user_id_idx" ON "payment_logs"("user_id");
CREATE INDEX "payment_logs_gateway_idx" ON "payment_logs"("gateway");
CREATE INDEX "payment_logs_status_idx" ON "payment_logs"("status");
CREATE INDEX "payment_logs_type_idx" ON "payment_logs"("type");
CREATE INDEX "payment_logs_created_at_idx" ON "payment_logs"("created_at");

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_plan_slug_fkey" FOREIGN KEY ("plan_slug") REFERENCES "subscription_plans"("slug") ON DELETE SET NULL ON UPDATE CASCADE;

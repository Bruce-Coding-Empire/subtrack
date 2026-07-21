import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1784639292193 implements MigrationInterface {
    name = 'InitSchema1784639292193'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying NOT NULL, "password_hash" character varying NOT NULL, "base_currency" character varying NOT NULL DEFAULT 'RWF', "monthly_spend_limit" numeric, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_preferences" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "renewal_reminders_enabled" boolean NOT NULL DEFAULT false, "spend_limit_alerts_enabled" boolean NOT NULL DEFAULT false, "push_token" text, CONSTRAINT "PK_e94e2b543f2f218ee68e4f4fad2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_billing_cycle_enum" AS ENUM('weekly', 'monthly', 'yearly', 'custom')`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_category_enum" AS ENUM('entertainment', 'software', 'fitness', 'utilities', 'other')`);
        await queryRunner.query(`CREATE TYPE "public"."subscriptions_status_enum" AS ENUM('active', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying NOT NULL, "cost" numeric NOT NULL, "currency" character varying NOT NULL, "billing_cycle" "public"."subscriptions_billing_cycle_enum" NOT NULL, "custom_interval_days" integer, "category" "public"."subscriptions_category_enum" NOT NULL, "status" "public"."subscriptions_status_enum" NOT NULL DEFAULT 'active', "start_date" date NOT NULL, "next_renewal_date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a87248d73155605cf782be9ee5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d0a95ef8a28188364c546eb65c" ON "subscriptions"  ("user_id") `);
        await queryRunner.query(`CREATE TABLE "payment_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "subscription_id" uuid NOT NULL, "user_id" uuid NOT NULL, "amount" numeric NOT NULL, "currency" character varying NOT NULL, "paid_at" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5fcec51a769b65c0c3c0987f11c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_49c67bacd5be8771fdd48781b5" ON "payment_history"  ("subscription_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_87a6f5afc86958a2206e337065" ON "payment_history"  ("user_id") `);
        await queryRunner.query(`CREATE TABLE "exchange_rates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "base_currency" character varying NOT NULL, "target_currency" character varying NOT NULL, "rate" numeric NOT NULL, "fetched_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_33a614bad9e61956079d817ebe2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_exchange_rates_pair_date" ON "exchange_rates" ("base_currency", "target_currency", (("fetched_at")::date))`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_64c90edc7310c6be7c10c96f675" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_history" ADD CONSTRAINT "FK_49c67bacd5be8771fdd48781b55" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_history" ADD CONSTRAINT "FK_87a6f5afc86958a2206e337065f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payment_history" DROP CONSTRAINT "FK_87a6f5afc86958a2206e337065f"`);
        await queryRunner.query(`ALTER TABLE "payment_history" DROP CONSTRAINT "FK_49c67bacd5be8771fdd48781b55"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1"`);
        await queryRunner.query(`ALTER TABLE "notification_preferences" DROP CONSTRAINT "FK_64c90edc7310c6be7c10c96f675"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_exchange_rates_pair_date"`);
        await queryRunner.query(`DROP TABLE "exchange_rates"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87a6f5afc86958a2206e337065"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_49c67bacd5be8771fdd48781b5"`);
        await queryRunner.query(`DROP TABLE "payment_history"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d0a95ef8a28188364c546eb65c"`);
        await queryRunner.query(`DROP TABLE "subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_category_enum"`);
        await queryRunner.query(`DROP TYPE "public"."subscriptions_billing_cycle_enum"`);
        await queryRunner.query(`DROP TABLE "notification_preferences"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}

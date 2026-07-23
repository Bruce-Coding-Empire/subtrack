import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDetectedSubscriptions1784820438268 implements MigrationInterface {
    name = 'AddDetectedSubscriptions1784820438268'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."detected_subscriptions_billing_cycle_enum" AS ENUM('weekly', 'monthly', 'yearly', 'custom')`);
        await queryRunner.query(`CREATE TYPE "public"."detected_subscriptions_status_enum" AS ENUM('pending', 'approved', 'dismissed')`);
        await queryRunner.query(`CREATE TABLE "detected_subscriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "gmail_message_id" character varying NOT NULL, "vendor_name" text, "amount" numeric, "currency" text, "billing_cycle" "public"."detected_subscriptions_billing_cycle_enum", "raw_subject" text NOT NULL, "received_at" TIMESTAMP WITH TIME ZONE, "status" "public"."detected_subscriptions_status_enum" NOT NULL DEFAULT 'pending', "detected_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_34748b6717b90f8301d88943a23" UNIQUE ("user_id", "gmail_message_id"), CONSTRAINT "PK_0ac18be9a07d11cce05c11d0542" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_df0b9a266b1b2cfe6802725a90" ON "detected_subscriptions"  ("user_id") `);
        await queryRunner.query(`ALTER TABLE "detected_subscriptions" ADD CONSTRAINT "FK_df0b9a266b1b2cfe6802725a90c" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "detected_subscriptions" DROP CONSTRAINT "FK_df0b9a266b1b2cfe6802725a90c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df0b9a266b1b2cfe6802725a90"`);
        await queryRunner.query(`DROP TABLE "detected_subscriptions"`);
        await queryRunner.query(`DROP TYPE "public"."detected_subscriptions_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."detected_subscriptions_billing_cycle_enum"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailConnections1784817381848 implements MigrationInterface {
    name = 'AddEmailConnections1784817381848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_connections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "provider" character varying NOT NULL DEFAULT 'gmail', "access_token_encrypted" text NOT NULL, "refresh_token_encrypted" text, "connected_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0dc13c1e5d4961346ff504819e9" UNIQUE ("user_id", "provider"), CONSTRAINT "PK_7190425eab77d1c9a75a0e36573" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "email_connections" ADD CONSTRAINT "FK_ca61fa2fc2c2c513400e3abc6f1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "email_connections" DROP CONSTRAINT "FK_ca61fa2fc2c2c513400e3abc6f1"`);
        await queryRunner.query(`DROP TABLE "email_connections"`);
    }

}

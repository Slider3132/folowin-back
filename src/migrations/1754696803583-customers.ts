import { MigrationInterface, QueryRunner } from "typeorm";

export class Customers1754696803583 implements MigrationInterface {
    name = 'Customers1754696803583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "manager_customer_address" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "managerCustomerId" uuid NOT NULL, "label" character varying(100), "line1" character varying(255) NOT NULL, "line2" character varying(255), "city" character varying(120) NOT NULL, "region" character varying(120), "postalCode" character varying(20), "countryCode" character varying(2), "isDefault" boolean NOT NULL DEFAULT false, "placeId" character varying(128), "lat" numeric(10,6), "lng" numeric(10,6), CONSTRAINT "PK_2576947d44e4b9a20b3481d1153" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a77ae2e4cdbcfefe64b7c44a62" ON "manager_customer_address" ("managerCustomerId") `);
        await queryRunner.query(`ALTER TABLE "manager_customer" ADD "extra" jsonb`);
        await queryRunner.query(`ALTER TABLE "product_variant" ALTER COLUMN "purchasePrice" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "manager_customer" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "manager_customer" ADD "name" character varying(120)`);
        await queryRunner.query(`ALTER TABLE "manager_customer" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "manager_customer" ADD "category" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "manager_customer" DROP COLUMN "comment"`);
        await queryRunner.query(`ALTER TABLE "manager_customer" ADD "comment" character varying(1000)`);
        await queryRunner.query(`ALTER TABLE "manager_customer" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "manager_customer" ADD "notes" character varying(2000)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_820d804c755d35961373ec1621" ON "manager_customer" ("managerId", "customerId") `);
        await queryRunner.query(`ALTER TABLE "manager_customer_address" ADD CONSTRAINT "FK_a77ae2e4cdbcfefe64b7c44a627" FOREIGN KEY ("managerCustomerId") REFERENCES "manager_customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "manager_customer_address" DROP CONSTRAINT "FK_a77ae2e4cdbcfefe64b7c44a627"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_820d804c755d35961373ec1621"`);
        await queryRunner.query(`ALTER TABLE "manager_customer" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "manager_customer" ADD "notes" character varying`);
        await queryRunner.query(`ALTER TABLE "manager_customer" DROP COLUMN "comment"`);
        await queryRunner.query(`ALTER TABLE "manager_customer" ADD "comment" character varying`);
        await queryRunner.query(`ALTER TABLE "manager_customer" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "manager_customer" ADD "category" character varying`);
        await queryRunner.query(`ALTER TABLE "manager_customer" DROP COLUMN "name"`);
        await queryRunner.query(`ALTER TABLE "manager_customer" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variant" ALTER COLUMN "purchasePrice" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "manager_customer" DROP COLUMN "extra"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a77ae2e4cdbcfefe64b7c44a62"`);
        await queryRunner.query(`DROP TABLE "manager_customer_address"`);
    }

}

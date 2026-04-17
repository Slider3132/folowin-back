import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorProductStatus1770688548253 implements MigrationInterface {
    name = 'RefactorProductStatus1770688548253'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Product changes - Add new columns first
        await queryRunner.query(`CREATE TYPE "public"."product_status_enum" AS ENUM('DRAFT', 'ACTIVE', 'ARCHIVED', 'HIDDEN')`);
        await queryRunner.query(`ALTER TABLE "product" ADD "status" "public"."product_status_enum" NOT NULL DEFAULT 'DRAFT'`);
        await queryRunner.query(`CREATE TYPE "public"."product_availability_enum" AS ENUM('IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER', 'ON_DEMAND')`);
        await queryRunner.query(`ALTER TABLE "product" ADD "availability" "public"."product_availability_enum" NOT NULL DEFAULT 'IN_STOCK'`);
        await queryRunner.query(`ALTER TABLE "product_variant" ADD "stock" integer NOT NULL DEFAULT '0'`);

        // Migrate data
        await queryRunner.query(`UPDATE "product" SET "status" = 'ACTIVE' WHERE "isActive" = true`);
        await queryRunner.query(`UPDATE "product" SET "status" = 'DRAFT' WHERE "isActive" = false`);

        // Drop old columns
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "isActive"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "availability"`);
        await queryRunner.query(`DROP TYPE "public"."product_availability_enum"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."product_status_enum"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "isActive" boolean NOT NULL DEFAULT true`);
    }

}

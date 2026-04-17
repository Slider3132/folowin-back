import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeProductCodeNullable1754653940511 implements MigrationInterface {
    name = 'MakeProductCodeNullable1754653940511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "code" TO "sku"`);
        await queryRunner.query(`ALTER TABLE "product_variant" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "product_variant" ADD "order" integer`);
        await queryRunner.query(`ALTER TABLE "product_variant" ALTER COLUMN "sku" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variant" DROP CONSTRAINT "UQ_f4dc2c0888b66d547c175f090e2"`);
        await queryRunner.query(`ALTER TABLE "product_variant" ALTER COLUMN "price" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "product_variant" ALTER COLUMN "purchasePrice" TYPE numeric(12,2)`);
        await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "unit"`);
        await queryRunner.query(`CREATE TYPE "public"."product_variant_unit_enum" AS ENUM('pcs', 'kg', 'g', 'l', 'ml', 'pack')`);
        await queryRunner.query(`ALTER TABLE "product_variant" ADD "unit" "public"."product_variant_unit_enum"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a3ef0cfb54934672d04f306479" ON "product_variant" ("productId", "name") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_7a8b1ee732fec84f0b8ed9b91a" ON "product_variant" ("productId", "sku") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_7a8b1ee732fec84f0b8ed9b91a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a3ef0cfb54934672d04f306479"`);
        await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "unit"`);
        await queryRunner.query(`DROP TYPE "public"."product_variant_unit_enum"`);
        await queryRunner.query(`ALTER TABLE "product_variant" ADD "unit" character varying`);
        await queryRunner.query(`ALTER TABLE "product_variant" ALTER COLUMN "purchasePrice" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "product_variant" ALTER COLUMN "price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "product_variant" ADD CONSTRAINT "UQ_f4dc2c0888b66d547c175f090e2" UNIQUE ("sku")`);
        await queryRunner.query(`ALTER TABLE "product_variant" ALTER COLUMN "sku" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "order"`);
        await queryRunner.query(`ALTER TABLE "product_variant" DROP COLUMN "isActive"`);
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "sku" TO "code"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeProductCodeNullable1754650681556 implements MigrationInterface {
    name = 'MakeProductCodeNullable1754650681556'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "code" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "UQ_99c39b067cfa73c783f0fc49a61"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "UQ_99c39b067cfa73c783f0fc49a61" UNIQUE ("code")`);
        await queryRunner.query(`ALTER TABLE "product" ALTER COLUMN "code" SET NOT NULL`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModules1754644522431 implements MigrationInterface {
    name = 'AddModules1754644522431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" ADD "categoryId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "categoryId"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Media1754647591940 implements MigrationInterface {
    name = 'Media1754647591940'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "media" ADD "categoryId" uuid`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_442eca5123705b2f8af27d5f065" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_442eca5123705b2f8af27d5f065"`);
        await queryRunner.query(`ALTER TABLE "media" DROP COLUMN "categoryId"`);
        await queryRunner.query(`ALTER TABLE "media" ADD "categoryId" character varying`);
    }

}

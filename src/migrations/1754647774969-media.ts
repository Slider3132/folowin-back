import { MigrationInterface, QueryRunner } from "typeorm";

export class Media1754647774969 implements MigrationInterface {
    name = 'Media1754647774969'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_8a12e4cb68bc526f8d8e59efb12"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "imageId"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "category" ADD "imageId" uuid`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_8a12e4cb68bc526f8d8e59efb12" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

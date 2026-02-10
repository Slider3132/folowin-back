import { MigrationInterface, QueryRunner } from "typeorm";

export class Oders1754715099327 implements MigrationInterface {
    name = 'Oders1754715099327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_cf9be488fee0f45c0da5acbda9d"`);
        await queryRunner.query(`ALTER TABLE "order" RENAME COLUMN "managerCustomerId" TO "managerId"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "managerId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_498abba8d72fb5bb8f9b58482ae" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_498abba8d72fb5bb8f9b58482ae"`);
        await queryRunner.query(`ALTER TABLE "order" ALTER COLUMN "managerId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order" RENAME COLUMN "managerId" TO "managerCustomerId"`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_cf9be488fee0f45c0da5acbda9d" FOREIGN KEY ("managerCustomerId") REFERENCES "manager_customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}

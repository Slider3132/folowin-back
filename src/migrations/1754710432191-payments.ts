import { MigrationInterface, QueryRunner } from "typeorm";

export class Payments1754710432191 implements MigrationInterface {
    name = 'Payments1754710432191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "shipping_method_payment_methods" ("shipping_method_id" uuid NOT NULL, "payment_method_id" uuid NOT NULL, CONSTRAINT "PK_7894e5339aea05c425540470d3c" PRIMARY KEY ("shipping_method_id", "payment_method_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7868c81790d0e9c60c40ff57c4" ON "shipping_method_payment_methods" ("shipping_method_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7f552684cb0a99322ffd6b40b8" ON "shipping_method_payment_methods" ("payment_method_id") `);
        await queryRunner.query(`ALTER TABLE "shipping_method_payment_methods" ADD CONSTRAINT "FK_7868c81790d0e9c60c40ff57c44" FOREIGN KEY ("shipping_method_id") REFERENCES "shipping_method"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "shipping_method_payment_methods" ADD CONSTRAINT "FK_7f552684cb0a99322ffd6b40b84" FOREIGN KEY ("payment_method_id") REFERENCES "payment_method"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shipping_method_payment_methods" DROP CONSTRAINT "FK_7f552684cb0a99322ffd6b40b84"`);
        await queryRunner.query(`ALTER TABLE "shipping_method_payment_methods" DROP CONSTRAINT "FK_7868c81790d0e9c60c40ff57c44"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f552684cb0a99322ffd6b40b8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7868c81790d0e9c60c40ff57c4"`);
        await queryRunner.query(`DROP TABLE "shipping_method_payment_methods"`);
    }

}

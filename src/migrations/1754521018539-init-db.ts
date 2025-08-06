import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDb1754521018539 implements MigrationInterface {
    name = 'InitDb1754521018539'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_roles_enum" AS ENUM('admin', 'manager', 'user', 'guest')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "avatar" character varying, "email" character varying NOT NULL, "password" character varying, "first_name" character varying, "last_name" character varying, "phone" character varying, "roles" "public"."user_roles_enum" array NOT NULL, "address" text, "language" character varying NOT NULL DEFAULT 'ua', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."verification_code_type_enum" AS ENUM('password', 'email')`);
        await queryRunner.query(`CREATE TABLE "verification_code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "code" integer NOT NULL, "type" "public"."verification_code_type_enum" NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "expired_at" TIMESTAMP NOT NULL, "user_id" uuid, CONSTRAINT "PK_d702c086da466e5d25974512d46" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "verification_code" ADD CONSTRAINT "FK_20dc9f8d86616620881be140833" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "verification_code" DROP CONSTRAINT "FK_20dc9f8d86616620881be140833"`);
        await queryRunner.query(`DROP TABLE "verification_code"`);
        await queryRunner.query(`DROP TYPE "public"."verification_code_type_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_roles_enum"`);
    }

}

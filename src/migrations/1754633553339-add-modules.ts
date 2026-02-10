import { MigrationInterface, QueryRunner } from "typeorm";

export class AddModules1754633553339 implements MigrationInterface {
    name = 'AddModules1754633553339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "address" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "managerCustomerId" uuid NOT NULL, "label" character varying NOT NULL, "address" character varying NOT NULL, "googlePlaceId" character varying, "isDefault" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_d92de1f82754668b5f5f5dd4fd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payment_method" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "type" character varying, "isActive" boolean NOT NULL DEFAULT true, "isGlobal" boolean NOT NULL DEFAULT false, "managerId" uuid, "description" character varying, "externalId" character varying, "settings" json, "order" integer, CONSTRAINT "PK_7744c2b2dd932c9cf42f2b9bc3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "shipping_method" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "description" character varying, "type" character varying, "isActive" boolean NOT NULL DEFAULT true, "price" numeric, "externalId" character varying, "settings" json, "order" integer, "cities" text, CONSTRAINT "PK_b9b0adfad3c6b99229c1e7d4865" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "slug" character varying NOT NULL, "description" character varying, "parentId" uuid, "order" integer, "isActive" boolean NOT NULL DEFAULT true, "imageId" uuid, "icon" character varying, CONSTRAINT "UQ_cb73208f151aa71cdd78f662d70" UNIQUE ("slug"), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "code" character varying NOT NULL, "description" character varying, "categoryId" uuid NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "minOrderQuantity" integer NOT NULL DEFAULT '1', "orderStep" integer NOT NULL DEFAULT '1', CONSTRAINT "UQ_99c39b067cfa73c783f0fc49a61" UNIQUE ("code"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "url" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'image', "productId" uuid, "productVariantId" uuid, "order" integer, CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_variant" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "productId" uuid NOT NULL, "name" character varying NOT NULL, "sku" character varying NOT NULL, "price" numeric NOT NULL DEFAULT '0', "purchasePrice" numeric NOT NULL DEFAULT '0', "attributes" jsonb, "unit" character varying, "minOrderQuantity" integer, "orderStep" integer, CONSTRAINT "UQ_f4dc2c0888b66d547c175f090e2" UNIQUE ("sku"), CONSTRAINT "PK_1ab69c9935c61f7c70791ae0a9f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "orderId" uuid NOT NULL, "productId" uuid NOT NULL, "productVariantId" uuid NOT NULL, "name" character varying NOT NULL, "unit" character varying NOT NULL, "quantity" numeric NOT NULL, "price" numeric NOT NULL, "purchasePrice" numeric NOT NULL DEFAULT '0', "total" numeric NOT NULL, "discount" numeric, "attributes" jsonb, CONSTRAINT "PK_d01158fe15b1ead5c26fd7f4e90" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "customerId" uuid NOT NULL, "managerCustomerId" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'new', "shippingMethodId" uuid NOT NULL, "deliveryAddress" character varying NOT NULL, "shippingPrice" numeric, "deliveryStatus" character varying, "trackingNumber" character varying, "deliveryComment" character varying, "paymentMethodId" uuid NOT NULL, "paymentComment" character varying, "paymentStatus" character varying, "paidAt" TIMESTAMP, "total" numeric NOT NULL DEFAULT '0', "discount" numeric, "notes" character varying, CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "phone" character varying NOT NULL, "email" character varying, "userId" character varying, CONSTRAINT "UQ_03846b4bae9df80f19c76005a82" UNIQUE ("phone"), CONSTRAINT "UQ_fdb2f3ad8115da4c7718109a6eb" UNIQUE ("email"), CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "manager_customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP DEFAULT now(), "deleted_at" TIMESTAMP, "customerId" uuid NOT NULL, "managerId" uuid NOT NULL, "name" character varying NOT NULL, "notes" character varying, "category" character varying, "comment" character varying, CONSTRAINT "PK_e562dfab17d1928685519d0b63f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "address" ADD CONSTRAINT "FK_df19d9fd5e025d209d60c059a34" FOREIGN KEY ("managerCustomerId") REFERENCES "manager_customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payment_method" ADD CONSTRAINT "FK_7c157722e143938e39de67ab06b" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10" FOREIGN KEY ("parentId") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "category" ADD CONSTRAINT "FK_8a12e4cb68bc526f8d8e59efb12" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_ff0c0301a95e517153df97f6812" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_43222947f71eee4febe010e3687" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_e60d0634847d803f8f9ade1059a" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_variant" ADD CONSTRAINT "FK_6e420052844edf3a5506d863ce6" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_904370c093ceea4369659a3c810" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_item" ADD CONSTRAINT "FK_7e2fe82497aa29798b51511ada4" FOREIGN KEY ("productVariantId") REFERENCES "product_variant"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_124456e637cca7a415897dce659" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_cf9be488fee0f45c0da5acbda9d" FOREIGN KEY ("managerCustomerId") REFERENCES "manager_customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_4af424d3e7b2c3cb26e075e20fc" FOREIGN KEY ("shippingMethodId") REFERENCES "shipping_method"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_89726ee65618314009b279e66e8" FOREIGN KEY ("paymentMethodId") REFERENCES "payment_method"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "manager_customer" ADD CONSTRAINT "FK_b94186685c7bc11c4bf53ba15c6" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "manager_customer" ADD CONSTRAINT "FK_a57ac0e68f5e812eb6fe0152476" FOREIGN KEY ("managerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "manager_customer" DROP CONSTRAINT "FK_a57ac0e68f5e812eb6fe0152476"`);
        await queryRunner.query(`ALTER TABLE "manager_customer" DROP CONSTRAINT "FK_b94186685c7bc11c4bf53ba15c6"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_89726ee65618314009b279e66e8"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_4af424d3e7b2c3cb26e075e20fc"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_cf9be488fee0f45c0da5acbda9d"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_124456e637cca7a415897dce659"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_7e2fe82497aa29798b51511ada4"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_904370c093ceea4369659a3c810"`);
        await queryRunner.query(`ALTER TABLE "order_item" DROP CONSTRAINT "FK_646bf9ece6f45dbe41c203e06e0"`);
        await queryRunner.query(`ALTER TABLE "product_variant" DROP CONSTRAINT "FK_6e420052844edf3a5506d863ce6"`);
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_e60d0634847d803f8f9ade1059a"`);
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_43222947f71eee4febe010e3687"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_ff0c0301a95e517153df97f6812"`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_8a12e4cb68bc526f8d8e59efb12"`);
        await queryRunner.query(`ALTER TABLE "category" DROP CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10"`);
        await queryRunner.query(`ALTER TABLE "payment_method" DROP CONSTRAINT "FK_7c157722e143938e39de67ab06b"`);
        await queryRunner.query(`ALTER TABLE "address" DROP CONSTRAINT "FK_df19d9fd5e025d209d60c059a34"`);
        await queryRunner.query(`DROP TABLE "manager_customer"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TABLE "order_item"`);
        await queryRunner.query(`DROP TABLE "product_variant"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP TABLE "shipping_method"`);
        await queryRunner.query(`DROP TABLE "payment_method"`);
        await queryRunner.query(`DROP TABLE "address"`);
    }

}

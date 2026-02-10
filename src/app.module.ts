import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getPostgresConfig } from './configs/database/pg.config';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CustomersModule } from './modules/customers/customers.module';
import { MediaModule } from './modules/media/media.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentMethodsModule } from './modules/payment-methods/payment-methods.module';
import { ProductsModule } from './modules/products/products.module';
import { ShippingMethodsModule } from './modules/shipping-methods/shipping-methods.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getPostgresConfig,
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    MediaModule,
    CustomersModule,
    PaymentMethodsModule,
    ShippingMethodsModule,
  ],
})
export class AppModule {}

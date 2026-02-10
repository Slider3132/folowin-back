import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';
import { ShippingMethod } from './entities/shipping-method';
import { ShippingMethodsController } from './shipping-methods.controller';
import { ShippingMethodsService } from './shipping-methods.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingMethod, PaymentMethod])],
  controllers: [ShippingMethodsController],
  providers: [JwtService, ShippingMethodsService],
  exports: [ShippingMethodsService],
})
export class ShippingMethodsModule {}

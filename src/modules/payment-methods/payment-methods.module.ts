import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodsController } from './payment-methods.controller';
import { PaymentMethodsService } from './payment-methods.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentMethod, User])],
  controllers: [PaymentMethodsController],
  providers: [JwtService, PaymentMethodsService],
})
export class PaymentMethodsModule {}

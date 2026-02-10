import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Address } from './entities/address.entity';
import { Customer } from './entities/customer.entity';
import { ManagerCustomer } from './entities/manager-customer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, ManagerCustomer, Address, Order]),
  ],
  providers: [JwtService, CustomersService],
  controllers: [CustomersController],
})
export class CustomersModule {}

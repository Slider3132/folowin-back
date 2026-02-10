import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

import { BaseEntity } from '@/common/entities/base.entity';
import { Customer } from '@/modules/customers/entities/customer.entity';
import { PaymentMethod } from '@/modules/payment-methods/entities/payment-method.entity';
import { ShippingMethod } from '@/modules/shipping-methods/entities/shipping-method';
import { User } from '@/modules/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { OrderItem } from './order-item.entity';

@Entity()
export class Order extends BaseEntity {
  @ManyToOne(() => Customer, (customer) => customer.orders, { eager: true })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager?: User;

  @ApiProperty({ default: 'new' })
  @Column({ default: 'new' })
  status: string;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  orderItems: OrderItem[];

  @ManyToOne(() => ShippingMethod, { eager: true })
  @JoinColumn({ name: 'shipping_method_id' })
  shippingMethod: ShippingMethod;

  @ApiProperty()
  @Column()
  deliveryAddress: string;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', nullable: true })
  shippingPrice?: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  deliveryStatus?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  trackingNumber?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  deliveryComment?: string;

  @ManyToOne(() => PaymentMethod, { eager: true })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  paymentComment?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  paymentStatus?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;

  @ApiProperty()
  @Column({ type: 'decimal', default: 0 })
  total: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', nullable: true })
  discount?: number;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  notes?: string;
}

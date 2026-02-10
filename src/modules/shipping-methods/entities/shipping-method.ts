import { BaseEntity } from '@/common/entities/base.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { PaymentMethod } from '@/modules/payment-methods/entities/payment-method.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class ShippingMethod extends BaseEntity {
  @ApiProperty({
    example: 'Новая Почта',
    description: 'Название способа доставки',
  })
  @Column()
  name: string;

  @ApiProperty({ example: 'Доставка по всей Украине', required: false })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({
    example: 'post',
    required: false,
    description: 'Тип доставки',
  })
  @Column({ nullable: true })
  type?: string; // pickup, courier, post и т.д.

  @ApiProperty({ example: true, description: 'Активен ли метод' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: 100,
    required: false,
    description: 'Фиксированная цена',
  })
  @Column({ type: 'decimal', nullable: true })
  price?: number;

  @ApiProperty({ required: false, description: 'Внешний ID для интеграций' })
  @Column({ nullable: true })
  externalId?: string;

  @ApiProperty({ required: false, description: 'Параметры интеграции, JSON' })
  @Column({ type: 'json', nullable: true })
  settings?: any;

  @ApiProperty({ example: 1, required: false, description: 'Порядок в списке' })
  @Column({ nullable: true })
  order?: number;

  @ApiProperty({ required: false, description: 'Разрешённые города' })
  @Column('simple-array', { nullable: true })
  cities?: string[];

  @ApiProperty({
    type: () => [PaymentMethod],
    required: false,
    description: 'Методы оплаты, доступные для данного способа доставки',
  })
  @ManyToMany(() => PaymentMethod)
  @JoinTable({
    name: 'shipping_method_payment_methods',
    joinColumn: { name: 'shipping_method_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'payment_method_id',
      referencedColumnName: 'id',
    },
  })
  paymentMethods?: PaymentMethod[];

  @OneToMany(() => Order, (order) => order.shippingMethod)
  orders: Order[];
}

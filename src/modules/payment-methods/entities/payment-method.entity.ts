import { BaseEntity } from '@/common/entities/base.entity';
import { Order } from '@/modules/orders/entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/users/entities/user.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

import { ShippingMethod } from '@/modules/shipping-methods/entities/shipping-method';

@Entity()
export class PaymentMethod extends BaseEntity {
  @ApiProperty({ example: 'Карта', description: 'Название способа оплаты' })
  @Column()
  name: string;

  @ApiProperty({
    example: 'card',
    description: 'Тип ("cash", "card", "invoice", ...)',
  })
  @Column({ nullable: true })
  type?: string;

  @ApiProperty({ example: true, description: 'Показывать ли в списке' })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: true,
    description: 'Общий ли способ оплаты (доступен всем)',
  })
  @Column({ default: false })
  isGlobal: boolean;

  @ApiProperty({ description: 'Описание', required: false })
  @Column({ nullable: true })
  description?: string;

  @ApiProperty({ required: false, description: 'Внешний ID для интеграций' })
  @Column({ nullable: true })
  externalId?: string;

  @ApiProperty({ required: false, description: 'Параметры интеграции, JSON' })
  @Column({ type: 'json', nullable: true })
  settings?: any;

  @ApiProperty({
    example: 1,
    required: false,
    description: 'Порядок сортировки',
  })
  @Column({ nullable: true })
  order?: number;

  @ManyToOne(() => User, { nullable: true })
  manager?: User;

  @ApiProperty({
    type: () => [ShippingMethod],
    required: false,
    description: 'Способи доставки, де цей метод оплати доступний',
  })
  @ManyToMany(
    () => ShippingMethod,
    (shippingMethod) => shippingMethod.paymentMethods,
  )
  shippingMethods?: ShippingMethod[];

  @OneToMany(() => Order, (order) => order.paymentMethod)
  orders: Order[];
}

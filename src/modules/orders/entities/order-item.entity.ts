import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '@/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ProductVariant } from 'src/modules/products/entities/product-variant.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Order } from './order.entity';

@Entity()
export class OrderItem extends BaseEntity {
  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  unit: string;

  @ApiProperty()
  @Column({ type: 'decimal' })
  quantity: number;

  @ApiProperty()
  @Column({ type: 'decimal' })
  price: number;

  @ApiProperty({ description: 'Цена закупки', example: 100 })
  @Column({ type: 'decimal', default: 0 })
  purchasePrice: number;

  @ApiProperty()
  @Column({ type: 'decimal' })
  total: number;

  @ApiProperty({ required: false })
  @Column({ type: 'decimal', nullable: true })
  discount?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'jsonb', nullable: true })
  attributes?: Record<string, any>;
}

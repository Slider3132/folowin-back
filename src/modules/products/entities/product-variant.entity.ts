import { BaseEntity } from '@/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Media } from 'src/modules/media/entities/media.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Unit } from '../enums/unit.enum';
import { Product } from './product.entity';

const numericTransformer = {
  to: (v: number | null) => v,
  from: (v: string | null) => (v === null ? null : parseFloat(v)),
};

@Index(['productId', 'sku'], { unique: true })
@Index(['productId', 'name'], { unique: true })
@Entity()
export class ProductVariant extends BaseEntity {
  @ApiProperty()
  @Column({ name: 'product_id' })
  productId: string | null;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: Product | null;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty({ description: 'SKU варианта (уникален в рамках productId)' })
  @Column({ nullable: true })
  sku?: string;

  @ApiProperty({ example: 59.9 })
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
  })
  price: number;

  @ApiProperty({ description: 'Цена закупки', example: 30 })
  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: numericTransformer,
    nullable: true,
  })
  purchasePrice: number;

  @ApiProperty({ required: false })
  @Column({ type: 'jsonb', nullable: true })
  attributes?: Record<string, any>;

  @ApiProperty({ required: false, enum: Unit })
  @Column({ type: 'enum', enum: Unit, nullable: true })
  unit?: Unit;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  minOrderQuantity?: number;

  @ApiProperty({ required: false })
  @Column({ type: 'int', nullable: true })
  orderStep?: number;

  @ApiProperty({ default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ required: false, description: 'Сортировка' })
  @Column({ type: 'int', nullable: true })
  order?: number;

  @OneToMany(() => Media, (media) => media.productVariant, { cascade: true })
  media: Media[];
}

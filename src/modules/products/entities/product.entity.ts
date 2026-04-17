import { BaseEntity } from '@/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/modules/categories/entities/category.entity';
import { Media } from 'src/modules/media/entities/media.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { ProductVariant } from './product-variant.entity';
import { AvailabilityStatus, ProductStatus } from './product.enums';

@Entity()
export class Product extends BaseEntity {
  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ nullable: true })
  sku?: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Category, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ApiProperty({ enum: ProductStatus })
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @ApiProperty({ enum: AvailabilityStatus })
  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.IN_STOCK,
  })
  availability: AvailabilityStatus;

  @ApiProperty()
  @Column({ default: 1 })
  minOrderQuantity: number;

  @ApiProperty()
  @Column({ default: 1 })
  orderStep: number;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
  })
  variants: ProductVariant[];

  @OneToMany(() => Media, (media) => media.product, { cascade: true })
  media: Media[];
}

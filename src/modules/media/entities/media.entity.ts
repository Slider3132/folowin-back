import { BaseEntity } from '@/common/entities/base.entity';
import { Category } from '@/modules/categories/entities/category.entity';
import { ApiProperty } from '@nestjs/swagger';
import { ProductVariant } from 'src/modules/products/entities/product-variant.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Media extends BaseEntity {
  @ApiProperty({
    example: 'https://domain.com/image.jpg',
    description: 'URL файла',
  })
  @Column()
  url: string;

  @ApiProperty({ example: 'image', description: 'Тип: image, video, other' })
  @Column({ default: 'image' })
  type: 'image' | 'video' | 'other';

  @ManyToOne(() => Product, (product) => product.media, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product?: Product;

  @ManyToOne(() => ProductVariant, (variant) => variant.media, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant?: ProductVariant;

  @ManyToOne(() => Category, (category) => category.media, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category?: Category;

  @ApiProperty({
    example: 1,
    description: 'Порядок для сортировки',
    required: false,
  })
  @Column({ nullable: true })
  order?: number;
}

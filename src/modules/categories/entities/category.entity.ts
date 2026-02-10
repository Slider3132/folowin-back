import { BaseEntity } from '@/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Media } from 'src/modules/media/entities/media.entity';
import { Product } from 'src/modules/products/entities/product.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Category extends BaseEntity {
  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => Category, (category) => category.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_id' })
  parent?: Category | null;

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  order?: number;

  @ApiProperty({ default: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ required: false })
  @Column({ nullable: true })
  icon?: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @OneToMany(() => Media, (media) => media.category, { cascade: true })
  media: Media[];
}

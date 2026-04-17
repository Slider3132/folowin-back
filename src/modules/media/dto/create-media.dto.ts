import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateMediaDto {
  @ApiProperty({
    example: '/uploads/products/1688922338237-99_img.png',
    description: 'URL до файла (ставится автоматически при upload)',
  })
  @IsOptional()
  @IsString()
  url: string;

  @ApiPropertyOptional({
    example: 'image',
    enum: ['image', 'video', 'other'],
    description: 'Тип файла',
  })
  @IsOptional()
  @IsIn(['image', 'video', 'other'])
  type?: 'image' | 'video' | 'other';

  @ApiPropertyOptional({ example: 1, description: 'Порядок сортировки' })
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({
    example: 'category-uuid',
    description: 'ID категории (если это фото категории)',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: 'product-uuid',
    description: 'ID продукта (если это фото продукта)',
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    example: 'variant-uuid',
    description: 'ID варианта продукта (если это фото варианта)',
  })
  @IsOptional()
  @IsUUID()
  productVariantId?: string;
}

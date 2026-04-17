import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { AvailabilityStatus, ProductStatus } from '../entities/product.enums';
import { CreateProductVariantDto } from './create-product-variant.dto';

export class CreateProductDto {
  @ApiProperty({ example: 'Томатний сік', description: 'Назва продукту' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: '100% натуральний сік з томатів',
    description: 'Опис продукту',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1, description: 'Порядок для сортування' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  orderStep?: number;

  @ApiPropertyOptional({ enum: ProductStatus, description: 'Статус продукту' })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ enum: AvailabilityStatus, description: 'Наявність' })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  availability?: AvailabilityStatus;

  @ApiProperty({ example: 'category-uuid', description: 'ID категорії' })
  @IsUUID()
  categoryId: string;

  @ApiPropertyOptional({
    example: 'SKU123',
    description: 'Артикул або код продукту',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Мінімальна партія замовлення',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minOrderQuantity?: number;

  @ApiPropertyOptional({
    example: ['Новинка', 'Еко'],
    description: 'Теги продукту',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'ID обкладинки (media)',
    example: 'media-uuid',
  })
  @IsOptional()
  @IsUUID()
  imageId?: string;

  @ApiPropertyOptional({
    description: 'ID галереї медіа',
    example: ['media-uuid1', 'media-uuid2'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  mediaIds?: string[];

  @ApiPropertyOptional({ type: [CreateProductVariantDto] })
  @IsOptional()
  @Type(() => CreateProductVariantDto)
  variants?: Omit<CreateProductVariantDto, 'productId'>[];
}

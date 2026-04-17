import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';
import { Unit } from '../enums/unit.enum';

export class CreateProductVariantDto {
  @ApiProperty({ description: 'ID продукта' })
  @IsUUID()
  productId: string; // придёт из URL, но валидируем

  @ApiProperty({ example: '1 л' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 10, description: 'Кількість на складі' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @ApiProperty({ example: 'SKU-TOM-1L' })
  @IsString()
  @IsOptional()
  sku: string;

  @ApiProperty({ example: 59.9 })
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ example: 30 })
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  @Min(0)
  @IsOptional()
  purchasePrice?: number;

  @ApiPropertyOptional({ example: { volume: '1l' } })
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ enum: Unit, example: Unit.PCS })
  @IsOptional()
  @IsEnum(Unit)
  unit?: Unit;

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  @Min(1)
  minOrderQuantity?: number;

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  @Min(1)
  orderStep?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional({ example: '4820000000000' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional({ example: 1000 })
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  weightGrams?: number;

  @ApiPropertyOptional({ example: 1000 })
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  volumeMl?: number;

  @ApiPropertyOptional({ type: [String], description: 'ID медиа' })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  mediaIds?: string[];
}

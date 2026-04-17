import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsArray,
    IsEnum,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';
import { Unit } from '../enums/unit.enum';

export class UpdateProductVariantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sku?: string;
  
  @ApiPropertyOptional({ example: 10 })
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  purchasePrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @ApiPropertyOptional({ enum: Unit })
  @IsOptional()
  @IsEnum(Unit)
  unit?: Unit;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  @Min(1)
  minOrderQuantity?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  @Min(1)
  orderStep?: number;

  @ApiPropertyOptional()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  weightGrams?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsOptional()
  @IsNumber()
  volumeMl?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  mediaIds?: string[];
}

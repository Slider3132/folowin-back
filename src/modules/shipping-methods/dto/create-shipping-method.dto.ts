// src/modules/shipping/dto/create-shipping-method.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateShippingMethodDto {
  @ApiProperty({
    example: 'Нова пошта',
    description: 'Назва способу доставки',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Доставка по всій Україні',
    description: 'Опис способу доставки',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'post',
    description: 'Тип доставки (pickup, courier, post тощо)',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Активний метод',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 100,
    description: 'Фіксована ціна',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    example: 'ext_123',
    description: 'Зовнішній ID для інтеграцій',
  })
  @IsString()
  @IsOptional()
  externalId?: string;

  @ApiPropertyOptional({
    description: 'Параметри інтеграції (JSON)',
    example: { apiKey: 'xxx', service: 'nova-poshta' },
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @ApiPropertyOptional({
    example: 1,
    description: 'Порядок у списку',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Дозволені міста',
    example: ['Київ', 'Львів', 'Одеса'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  cities?: string[];

  @ApiPropertyOptional({
    description:
      'Список ID методів оплати, доступних для цього способу доставки',
    example: ['pm_cash', 'pm_card'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  paymentMethodIds?: string[];
}

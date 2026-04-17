import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreatePaymentMethodDto {
  @ApiProperty({ example: 'Карта', description: 'Назва способу оплати' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'card',
    description: 'Тип ("cash", "card", "invoice", ...)',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Чи показувати у списку',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Чи є спосіб глобальним (доступний усім)',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isGlobal?: boolean;

  @ApiPropertyOptional({ description: 'ID менеджера (якщо не глобальний)' })
  @IsUUID('4')
  @IsOptional()
  managerId?: string;

  @ApiPropertyOptional({ description: 'Опис' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Зовнішній ID для інтеграцій' })
  @IsString()
  @IsOptional()
  externalId?: string;

  @ApiPropertyOptional({
    description: 'Параметри інтеграції (JSON)',
  })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @ApiPropertyOptional({ example: 1, description: 'Порядок сортування' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}

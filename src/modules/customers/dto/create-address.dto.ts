// src/modules/customers/dto/create-customer.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

/** Адреса в контексті зв’язку менеджер—клієнт (ManagerCustomerAddress) */
export class CreateManagerCustomerAddressDto {
  @ApiPropertyOptional({ example: 'Склад №1', description: 'Мітка адреси' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  label?: string;

  @ApiProperty({
    example: 'вул. Хрещатик, 1',
    description: 'Вулиця та будинок',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  line1: string;

  @ApiPropertyOptional({ example: 'офіс 12' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  line2?: string;

  @ApiProperty({ example: 'Київ' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city: string;

  @ApiPropertyOptional({ example: 'Київська' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  region?: string;

  @ApiPropertyOptional({ example: '01001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string;

  @ApiPropertyOptional({
    example: 'UA',
    description: 'Код країни ISO 3166-1 alpha-2',
  })
  @IsOptional()
  @IsString()
  @Length(2, 2)
  countryCode?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Адреса за замовчуванням',
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    example: 'ChIJBUVa4U7P1EAR_kYBF9IxSXY',
    description: 'Google Place ID',
  })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  placeId?: string;

  @ApiPropertyOptional({ example: 50.4501 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  lat?: number;

  @ApiPropertyOptional({ example: 30.5234 })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : value))
  @IsNumber()
  lng?: number;
}

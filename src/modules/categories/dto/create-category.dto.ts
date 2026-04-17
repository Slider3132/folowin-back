import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  Min,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Сири',
    description: 'Назва категорії',
    minLength: 2,
    maxLength: 128,
  })
  @IsString({ message: 'Назва має бути рядком' })
  @MinLength(2, { message: 'Назва має бути не менше 2 символів' })
  @MaxLength(128, { message: 'Назва має бути не більше 128 символів' })
  name: string;

  @ApiPropertyOptional({
    example: 'syry',
    description: 'URL-slug (буде згенеровано автоматично, якщо не вказано)',
    maxLength: 128,
  })
  @IsOptional()
  @IsString({ message: 'Slug має бути рядком' })
  @MaxLength(128, { message: 'Slug має бути не більше 128 символів' })
  slug?: string;

  @ApiPropertyOptional({
    example: 'Молочні та сирні продукти',
    description: 'Опис категорії',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Опис має бути рядком' })
  @MaxLength(500, { message: 'Опис має бути не більше 500 символів' })
  description?: string;

  @ApiPropertyOptional({
    example: '8fae2c4e-...-4a7e',
    description: 'ID батьківської категорії',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Некоректний формат UUID' })
  parentId?: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Порядок сортування',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Порядок має бути числом' })
  @Min(0, { message: "Порядок не може бути від'ємним" })
  order?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Чи активна категорія',
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive має бути булевим значенням' })
  isActive?: boolean;

  @ApiPropertyOptional({
    example: 'cheese',
    description: 'Іконка (назва іконки або emoji)',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Іконка має бути рядком' })
  @MaxLength(50, { message: 'Іконка має бути не більше 50 символів' })
  icon?: string;
}

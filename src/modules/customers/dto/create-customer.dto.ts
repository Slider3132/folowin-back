// src/modules/customers/dto/create-customer.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateManagerCustomerAddressDto } from './create-address.dto';

/** Плоский DTO: створюємо/знаходимо клієнта за телефоном + дані зв’язку менеджер—клієнт */
export class CreateCustomerDto {
  // --- Customer ---
  @ApiProperty({
    example: '+380671234567',
    description: 'Унікальний телефон клієнта (по ньому перевіряємо/створюємо)',
  })
  @IsPhoneNumber('UA')
  phone: string;

  @ApiPropertyOptional({ example: 'client@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: 'c5a9a0f2-0b1e-4b4c-8f7c-9ec3d6b4a1f2',
    description: 'ID користувача системи (якщо вже зареєстрований)',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  // --- ManagerCustomer ---
  @ApiPropertyOptional({
    example: 'Іван Петров',
    description: 'Як менеджер називає цього клієнта',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional({
    example: 'VIP',
    description: 'Категорія клієнта: роздріб/опт/VIP тощо',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  category?: string;

  @ApiPropertyOptional({
    example: 'Дзвонити після 17:00',
    description: 'Короткий коментар менеджера',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @ApiPropertyOptional({
    example: 'Постійний клієнт',
    description: 'Нотатки менеджера',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Додаткові поля для менеджера',
    example: { discountLevel: 'gold' },
  })
  @IsOptional()
  @IsObject()
  extra?: Record<string, any>;

  /** Адреси належать саме зв’язку ManagerCustomer; managerId візьмемо з авторизації */
  @ApiPropertyOptional({ type: [CreateManagerCustomerAddressDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateManagerCustomerAddressDto)
  addresses?: CreateManagerCustomerAddressDto[];
}

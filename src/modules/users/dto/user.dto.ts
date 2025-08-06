import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RolesEnum } from '../enums/roles.enum';

class Address {
  @ApiProperty({
    title: 'street address',
  })
  @IsString()
  street: string;

  @ApiProperty({
    title: 'street apartment',
  })
  @IsString()
  apartment: string;

  @ApiProperty({
    title: 'city',
  })
  @IsString()
  city: string;

  @ApiProperty({
    title: 'district',
  })
  @IsString()
  district: string;

  @ApiProperty({
    title: 'state/province',
  })
  @IsString()
  state: string;

  @ApiProperty({
    title: 'zip/postal code',
  })
  @IsString()
  zip: string;
}

export class UserDto {
  @ApiProperty({
    title: 'user role',
    enum: [RolesEnum],
    example: [RolesEnum.guest],
    required: false,
  })
  @IsEnum(RolesEnum)
  @IsOptional()
  role?: RolesEnum[] | null;

  @ApiProperty({
    title: 'user avatar',
    required: false,
  })
  @IsString()
  @IsOptional()
  avatar?: string | null;

  @ApiProperty({
    title: 'user email',
    required: false,
  })
  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string | null;

  @ApiProperty({
    title: 'user firstname',
    required: false,
  })
  @IsString()
  @IsOptional()
  firstName?: string | null;

  @ApiProperty({
    title: 'user lastname',
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string | null;

  @ApiProperty({
    title: 'phone',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string | null;

  @ApiProperty({
    title: 'address',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Address)
  address?: Address | null;

  @ApiProperty({
    title: 'language',
    required: false,
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  language?: string | null;
}

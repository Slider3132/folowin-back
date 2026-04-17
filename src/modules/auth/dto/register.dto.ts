import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    title: 'user email',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    title: 'user password',
  })
  @IsString()
  password: string;

  @ApiProperty({
    title: 'user firstname',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    title: 'user lastname',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    title: 'phone',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string | null;
}

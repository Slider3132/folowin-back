import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class LoginDto {
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
    title: 'user is remember',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  remember: boolean;
}

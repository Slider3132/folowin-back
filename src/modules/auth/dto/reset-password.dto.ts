import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    title: 'email',
  })
  @IsNumber()
  email: string;

  @ApiProperty({
    title: 'user password',
  })
  @IsString()
  password: string;
}

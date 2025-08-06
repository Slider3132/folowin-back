import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    title: 'user password',
  })
  @IsString()
  password: string;

  @ApiProperty({
    title: 'user current password',
  })
  @IsString()
  currentPassword: string;
}

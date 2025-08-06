import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({
    title: 'access token',
  })
  @IsString()
  token: string;

  @ApiProperty({
    title: 'user is remember',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  remember: boolean;
}

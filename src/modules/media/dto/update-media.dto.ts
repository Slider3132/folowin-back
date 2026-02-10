import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateMediaDto {
  @ApiPropertyOptional({ example: 'video', enum: ['image', 'video', 'other'] })
  @IsOptional()
  @IsIn(['image', 'video', 'other'])
  type?: 'image' | 'video' | 'other';

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productVariantId?: string;
}

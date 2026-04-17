import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  order?: number;

  @ApiProperty({ required: false })
  isActive?: boolean;

  @ApiProperty()
  categoryId: string;

  @ApiProperty({ required: false })
  sku?: string;

  @ApiProperty({ required: false })
  minOrderQuantity?: number;

  @ApiProperty({ required: false, type: [String] })
  tags?: string[];

  @ApiProperty({ required: false })
  imageId?: string;

  @ApiProperty({ required: false, type: [String] })
  mediaIds?: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

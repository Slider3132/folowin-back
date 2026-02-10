import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ResponseOrderItemDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  orderId: string;

  @Expose()
  @ApiProperty()
  productId: string;

  @Expose()
  @ApiProperty()
  productVariantId: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  unit: string;

  @Expose()
  @Type(() => Number)
  @ApiProperty()
  quantity: number;

  @Expose()
  @Type(() => Number)
  @ApiProperty()
  price: number;

  @Expose()
  @Type(() => Number)
  @ApiProperty({ description: 'Ціна закупівлі', default: 0 })
  purchasePrice: number;

  @Expose()
  @Type(() => Number)
  @ApiProperty()
  total: number;

  @Expose()
  @Type(() => Number)
  @ApiProperty({ required: false })
  discount?: number;

  @Expose()
  @ApiProperty({ required: false, type: Object })
  attributes?: Record<string, any>;

  @Expose()
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

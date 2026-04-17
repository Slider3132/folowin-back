import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ResponseOrderItemDto } from './response-order-item.dto';

export class ResponseOrderDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  customerId: string;

  // віддаємо пов’язані сутності лише в розширеному режимі (groups: ['expanded'])
  @Expose({ groups: ['expanded'] })
  @ApiProperty({ required: false, type: Object })
  customer?: any;

  @Expose()
  @ApiProperty()
  managerCustomerId: string;

  @Expose({ groups: ['expanded'] })
  @ApiProperty({ required: false, type: Object })
  managerCustomer?: any;

  @Expose()
  @ApiProperty({ default: 'new' })
  status: string;

  @Expose()
  @Type(() => ResponseOrderItemDto)
  @ApiProperty({ type: [ResponseOrderItemDto] })
  orderItems: ResponseOrderItemDto[];

  @Expose()
  @ApiProperty()
  shippingMethodId: string;

  @Expose({ groups: ['expanded'] })
  @ApiProperty({ required: false, type: Object })
  shippingMethod?: any;

  @Expose()
  @ApiProperty()
  deliveryAddress: string;

  @Expose()
  @Type(() => Number)
  @ApiProperty({ required: false })
  shippingPrice?: number;

  @Expose()
  @ApiProperty({ required: false })
  deliveryStatus?: string;

  @Expose()
  @ApiProperty({ required: false })
  trackingNumber?: string;

  @Expose()
  @ApiProperty({ required: false })
  deliveryComment?: string;

  @Expose()
  @ApiProperty()
  paymentMethodId: string;

  @Expose({ groups: ['expanded'] })
  @ApiProperty({ required: false, type: Object })
  paymentMethod?: any;

  @Expose()
  @ApiProperty({ required: false })
  paymentComment?: string;

  @Expose()
  @ApiProperty({ required: false })
  paymentStatus?: string;

  @Expose()
  @ApiProperty({ required: false, type: String, format: 'date-time' })
  paidAt?: Date;

  @Expose()
  @Type(() => Number)
  @ApiProperty({ default: 0 })
  total: number;

  @Expose()
  @Type(() => Number)
  @ApiProperty({ required: false })
  discount?: number;

  @Expose()
  @ApiProperty({ required: false })
  notes?: string;

  @Expose()
  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

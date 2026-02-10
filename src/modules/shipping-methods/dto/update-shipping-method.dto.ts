// src/modules/shipping/dto/update-shipping-method.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateShippingMethodDto } from './create-shipping-method.dto';

export class UpdateShippingMethodDto extends PartialType(
  CreateShippingMethodDto,
) {}

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { Roles } from '@/modules/auth/decorators/role.decorator';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';

import { UserDecorator } from '@/modules/users/decorators/user.decorator';
import { RolesEnum } from '@/modules/users/enums/roles.enum';
import { AuthorizedUserType } from '@/modules/users/types/authorized-user.type';

import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { ShippingMethod } from './entities/shipping-method';
import { ShippingMethodsService } from './shipping-methods.service';

@ApiTags('shipping')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('shipping-methods')
export class ShippingMethodsController {
  constructor(private readonly shippingService: ShippingMethodsService) {}

  // ===== READ =====
  @ApiOperation({ summary: 'Отримати всі способи доставки' })
  @ApiOkResponse({ type: [ShippingMethod] })
  @Get()
  findAll(
    @UserDecorator() user: AuthorizedUserType,
  ): Promise<ShippingMethod[]> {
    return this.shippingService.findAll(user);
  }

  @ApiOperation({ summary: 'Отримати лише активні способи доставки' })
  @ApiOkResponse({ type: [ShippingMethod] })
  @Get('/active')
  findActive(
    @UserDecorator() user: AuthorizedUserType,
  ): Promise<ShippingMethod[]> {
    return this.shippingService.findActive(user);
  }

  @ApiOperation({ summary: 'Отримати спосіб доставки за id' })
  @ApiOkResponse({ type: ShippingMethod })
  @ApiNotFoundResponse({ description: 'Метод доставки не знайдено' })
  @ApiParam({ name: 'id', description: 'ID способу доставки' })
  @Get(':id')
  findOne(
    @UserDecorator() user: AuthorizedUserType,
    @Param('id') id: string,
  ): Promise<ShippingMethod> {
    return this.shippingService.findOne(id, user);
  }

  // ===== CREATE (admin) =====
  @ApiOperation({ summary: 'Створити спосіб доставки (admin)' })
  @ApiCreatedResponse({ type: ShippingMethod })
  @ApiBadRequestResponse({ description: 'Невалідні дані' })
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Post()
  create(
    @UserDecorator() user: AuthorizedUserType,
    @Body() dto: CreateShippingMethodDto,
  ): Promise<ShippingMethod> {
    return this.shippingService.create(dto, user);
  }

  // ===== UPDATE (admin) =====
  @ApiOperation({ summary: 'Оновити спосіб доставки (admin)' })
  @ApiOkResponse({ type: ShippingMethod })
  @ApiNotFoundResponse({ description: 'Метод доставки не знайдено' })
  @ApiBadRequestResponse({ description: 'Невалідні дані' })
  @ApiParam({ name: 'id', description: 'ID способу доставки' })
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Patch(':id')
  update(
    @UserDecorator() user: AuthorizedUserType,
    @Param('id') id: string,
    @Body() dto: UpdateShippingMethodDto,
  ): Promise<ShippingMethod> {
    return this.shippingService.update(id, dto, user);
  }

  // ===== DELETE (admin) =====
  @ApiOperation({ summary: 'Видалити спосіб доставки (soft delete, admin)' })
  @ApiOkResponse({ description: 'Видалено' })
  @ApiParam({ name: 'id', description: 'ID способу доставки' })
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Delete(':id')
  remove(
    @UserDecorator() user: AuthorizedUserType,
    @Param('id') id: string,
  ): Promise<void> {
    return this.shippingService.remove(id, user);
  }
}

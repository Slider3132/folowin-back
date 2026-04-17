import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';

import { UserDecorator } from '@/modules/users/decorators/user.decorator';
import { RolesEnum } from '@/modules/users/enums/roles.enum';
import { AuthorizedUserType } from '../users/types/authorized-user.type';

import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentMethodsService } from './payment-methods.service';

@ApiTags('PaymentMethods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  // ====== READ ======
  @ApiOperation({
    summary: 'Отримати усі способи оплати, доступні користувачу',
  })
  @ApiOkResponse({ type: [PaymentMethod] })
  @Get()
  findAll(@UserDecorator() user: AuthorizedUserType): Promise<PaymentMethod[]> {
    return this.paymentMethodsService.findAll(user);
  }

  @ApiOperation({
    summary: 'Отримати АКТИВНІ способи оплати, доступні користувачу',
  })
  @ApiOkResponse({ type: [PaymentMethod] })
  @Get('active')
  findActive(
    @UserDecorator() user: AuthorizedUserType,
  ): Promise<PaymentMethod[]> {
    return this.paymentMethodsService.findActive(user);
  }

  @ApiOperation({
    summary: 'Отримати спосіб оплати за ID (з перевіркою доступу)',
  })
  @ApiOkResponse({ type: PaymentMethod })
  @ApiNotFoundResponse({
    description: 'Спосіб оплати не знайдено або немає доступу',
  })
  @ApiParam({ name: 'id', description: 'UUID способу оплати' })
  @Get(':id')
  findOne(
    @UserDecorator() user: AuthorizedUserType,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.findOne(id, user);
  }

  // ====== CREATE (дві різні точки входу, один сервісний метод) ======
  @ApiOperation({
    summary: 'Створити спосіб оплати (менеджерський, НЕ глобальний)',
    description: 'Усі обмеження застосовуються в сервісі.',
  })
  @ApiCreatedResponse({ type: PaymentMethod })
  @ApiBadRequestResponse({
    description: 'Невалідні дані / порушення правил доступу.',
  })
  @ApiUnauthorizedResponse({ description: 'Потрібна роль manager' })
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.manager)
  @Post()
  createByManager(
    @UserDecorator() user: AuthorizedUserType,
    @Body() dto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.createByManager(dto, user);
  }

  @ApiOperation({
    summary: 'Створити спосіб оплати (адмінський)',
    description: 'Усі обмеження застосовуються в сервісі.',
  })
  @ApiCreatedResponse({ type: PaymentMethod })
  @ApiBadRequestResponse({
    description: 'Невалідні дані / порушення правил доступу.',
  })
  @ApiUnauthorizedResponse({ description: 'Потрібна роль admin' })
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin)
  @Post('admin')
  createByAdmin(
    @UserDecorator() user: AuthorizedUserType,
    @Body() dto: CreatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.createByAdmin(dto, user);
  }

  // ====== UPDATE ======
  @ApiOperation({
    summary: 'Оновити спосіб оплати (admin/manager)',
    description: 'Усі обмеження застосовуються в сервісі.',
  })
  @ApiOkResponse({ type: PaymentMethod })
  @ApiBadRequestResponse({ description: 'Невалідні дані / обмеження ролей.' })
  @ApiParam({ name: 'id', description: 'UUID способу оплати' })
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin, RolesEnum.manager)
  @Patch(':id')
  update(
    @UserDecorator() user: AuthorizedUserType,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.updateByManager(id, dto, user);
  }

  @ApiOperation({
    summary: 'Оновити спосіб оплати (admin/manager)',
    description: 'Усі обмеження застосовуються в сервісі.',
  })
  @ApiOkResponse({ type: PaymentMethod })
  @ApiBadRequestResponse({ description: 'Невалідні дані / обмеження ролей.' })
  @ApiParam({ name: 'id', description: 'UUID способу оплати' })
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin, RolesEnum.manager)
  @Patch('admin/:id')
  updateByAdmin(
    @UserDecorator() user: AuthorizedUserType,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.updateByAdmin(id, dto, user);
  }

  // ====== DELETE ======
  @ApiOperation({
    summary: 'Видалити спосіб оплати (soft delete, admin/manager)',
    description: 'Логіка доступу — в сервісі.',
  })
  @ApiOkResponse({ description: 'Видалено' })
  @ApiParam({ name: 'id', description: 'UUID способу оплати' })
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin, RolesEnum.manager)
  @Delete(':id')
  remove(
    @UserDecorator() user: AuthorizedUserType,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.paymentMethodsService.removeByManager(id, user);
  }
  @ApiOperation({
    summary: 'Видалити спосіб оплати (soft delete, admin/manager)',
    description: 'Логіка доступу — в сервісі.',
  })
  @ApiOkResponse({ description: 'Видалено' })
  @ApiParam({ name: 'id', description: 'UUID способу оплати' })
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin, RolesEnum.manager)
  @Delete('admin/:id')
  removeByAdmin(
    @UserDecorator() user: AuthorizedUserType,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.paymentMethodsService.removeByManager(id, user);
  }
}

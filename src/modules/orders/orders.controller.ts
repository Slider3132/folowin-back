import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
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
import { plainToInstance } from 'class-transformer';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '../auth/decorators/role.decorator';

import { UserDecorator } from '@/modules/users/decorators/user.decorator';
import { RolesEnum } from '@/modules/users/enums/roles.enum';
import { AuthorizedUserType } from '../users/types/authorized-user.type';

import { CreateOrderDto } from './dto/create-order.dto';
import { ResponseOrderDto } from './dto/response-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  private toOrderDto(order: Order, expanded = false): ResponseOrderDto {
    return plainToInstance(ResponseOrderDto, order, {
      excludeExtraneousValues: true,
      groups: expanded ? ['expanded'] : undefined,
    });
  }

  // ====== READ ======
  @ApiOperation({
    summary: 'Отримати усі замовлення, доступні користувачу',
  })
  @ApiOkResponse({ type: [ResponseOrderDto] })
  @Get()
  async findAll(
    @UserDecorator() user: AuthorizedUserType,
    @Query('customerId') customerId?: string,
    @Query('expanded') expanded?: 'true' | 'false',
  ): Promise<ResponseOrderDto[]> {
    const items = await this.ordersService.findAll(user, customerId);
    const isExpanded = expanded === 'true';
    return items.map((o) => this.toOrderDto(o, isExpanded));
  }

  @ApiOperation({
    summary: 'Отримати замовлення за ID (з перевіркою доступу)',
  })
  @ApiOkResponse({ type: ResponseOrderDto })
  @ApiNotFoundResponse({
    description: 'Замовлення не знайдено або немає доступу',
  })
  @ApiParam({ name: 'id', description: 'UUID замовлення' })
  @Get(':id')
  async findOne(
    @UserDecorator() user: AuthorizedUserType,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('expanded') expanded?: 'true' | 'false',
  ): Promise<ResponseOrderDto> {
    return this.ordersService.findOne(id, user);
    // const order = await this.ordersService.findOne(id, user);
    // return this.toOrderDto(order, expanded === 'true');
  }

  // ====== CREATE ======
  @ApiOperation({
    summary: 'Створити замовлення (admin/manager)',
    description: 'Логіка доступу — в сервісі.',
  })
  @ApiCreatedResponse({ type: ResponseOrderDto })
  @ApiBadRequestResponse({
    description: 'Невалідні дані / обмеження ролей.',
  })
  @ApiUnauthorizedResponse({ description: 'Потрібна роль admin або manager' })
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin, RolesEnum.manager)
  @Post()
  async create(
    @UserDecorator() user: AuthorizedUserType,
    @Body() dto: CreateOrderDto,
  ): Promise<ResponseOrderDto> {
    const order = await this.ordersService.create(dto, user);
    return this.toOrderDto(order);
  }

  // ====== UPDATE ======
  @ApiOperation({
    summary: 'Оновити замовлення (admin/manager)',
    description: 'Логіка доступу — в сервісі.',
  })
  @ApiOkResponse({ type: ResponseOrderDto })
  @ApiBadRequestResponse({
    description: 'Невалідні дані / обмеження ролей.',
  })
  @ApiParam({ name: 'id', description: 'UUID замовлення' })
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin, RolesEnum.manager)
  @Patch(':id')
  async update(
    @UserDecorator() user: AuthorizedUserType,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateOrderDto,
  ): Promise<ResponseOrderDto> {
    const order = await this.ordersService.update(id, dto, user);
    return this.toOrderDto(order);
  }

  // ====== DELETE ======
  @ApiOperation({
    summary: 'Видалити замовлення (soft delete, admin/manager)',
    description: 'Логіка доступу — в сервісі.',
  })
  @ApiOkResponse({ description: 'Видалено' })
  @ApiParam({ name: 'id', description: 'UUID замовлення' })
  @UseGuards(RolesGuard)
  @Roles(RolesEnum.admin, RolesEnum.manager)
  @Delete(':id')
  async remove(
    @UserDecorator() user: AuthorizedUserType,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.ordersService.remove(id, user);
  }
}

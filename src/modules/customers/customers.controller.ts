import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { UserDecorator } from '@/modules/users/decorators/user.decorator';
import { AuthorizedUserType } from '@/modules/users/types/authorized-user.type';
import {
  ExceptionSchema,
  PaginationSchema,
} from '@/schemas/response/response.schema';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';

import { Roles } from '../auth/decorators/role.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolesEnum } from '../users/enums/roles.enum';
import { Customer } from './entities/customer.entity';
import { CreateManagerCustomerAddressDto } from './dto/create-address.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('Customers')
@Controller('customers')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Get()
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Пошук по телефону або імені (менеджерське ім’я)',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Фільтр за категорією (VIP/опт/…)',
  })
  @ApiQuery({ name: 'page', required: false, schema: { default: 1 } })
  @ApiQuery({ name: 'limit', required: false, schema: { default: 20 } })
  @ApiOkResponse({
    description: 'Successful',
    schema: PaginationSchema(Customer),
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  async list(
    @UserDecorator() user: AuthorizedUserType,
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.list(user, {
      q,
      category,
      page: Number(page),
      limit: Number(limit),
    });
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Successful' })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  @ApiNotFoundResponse({
    description: 'Customer not found',
    schema: ExceptionSchema,
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @UserDecorator() user: AuthorizedUserType,
  ) {
    return this.service.findOneForManager(user, id);
  }

  @Post()
  @Roles(RolesEnum.manager, RolesEnum.admin, RolesEnum.guest)
  @UseGuards(RolesGuard)
  @ApiOkResponse({ description: 'Successful' })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: ExceptionSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  async create(
    @UserDecorator() user: AuthorizedUserType,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.service.createOrLink(user, dto);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Successful' })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: ExceptionSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  @ApiNotFoundResponse({
    description: 'Customer not found',
    schema: ExceptionSchema,
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @UserDecorator() user: AuthorizedUserType,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.service.updateForManager(user, id, dto);
  }

  @HttpCode(204)
  @Delete(':id')
  @ApiOkResponse({ description: 'Successfully' })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  @ApiNotFoundResponse({
    description: 'Customer not found',
    schema: ExceptionSchema,
  })
  async unlink(
    @Param('id', ParseUUIDPipe) id: string,
    @UserDecorator() user: AuthorizedUserType,
  ): Promise<void> {
    await this.service.unlinkFromManager(user, id);
  }

  /* ===== Addresses (належать managerCustomer) ===== */

  @Post(':id/addresses')
  @ApiOkResponse({ description: 'Successful' })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: ExceptionSchema,
  })
  @ApiNotFoundResponse({
    description: 'Customer not found',
    schema: ExceptionSchema,
  })
  async addAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @UserDecorator() user: AuthorizedUserType,
    @Body() dto: CreateManagerCustomerAddressDto,
  ) {
    return this.service.addAddress(user, id, dto);
  }

  @Patch(':id/addresses/:addressId')
  @ApiOkResponse({ description: 'Successful' })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: ExceptionSchema,
  })
  @ApiNotFoundResponse({
    description: 'Customer | Address not found',
    schema: ExceptionSchema,
  })
  async updateAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @UserDecorator() user: AuthorizedUserType,
    @Body() dto: Partial<CreateManagerCustomerAddressDto>,
  ) {
    return this.service.updateAddress(user, id, addressId, dto);
  }

  @HttpCode(204)
  @Delete(':id/addresses/:addressId')
  @ApiOkResponse({ description: 'Successfully' })
  @ApiNotFoundResponse({
    description: 'Customer | Address not found',
    schema: ExceptionSchema,
  })
  async deleteAddress(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('addressId', ParseUUIDPipe) addressId: string,
    @UserDecorator() user: AuthorizedUserType,
  ): Promise<void> {
    await this.service.deleteAddress(user, id, addressId);
  }
}

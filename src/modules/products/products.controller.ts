// products.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags, OmitType } from '@nestjs/swagger';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { AvailabilityStatus, ProductStatus } from './entities/product.enums';
import { ProductsService } from './products.service';

// DTO для nested создания варианта (без productId в body)
export class CreateVariantForProductDto extends OmitType(
  CreateProductVariantDto,
  ['productId'] as const,
) {}

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /* ========= PRODUCTS ========= */

  @ApiOperation({ summary: 'Список продуктов с пагинацией и поиском' })
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('status') status?: ProductStatus,
    @Query('availability') availability?: AvailabilityStatus,
    @Query('categoryId') categoryId?: string,
  ): Promise<{ data: Product[]; total: number }> {
    return this.productsService.findAllWithPagination(
      page,
      limit,
      search,
      status,
      availability,
      categoryId,
    );
  }

  @ApiOperation({ summary: 'Получить продукт по ID (с вариантами и медиа)' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @ApiOperation({
    summary: 'Создать продукт (минимум 1 вариант создаётся автоматически)',
  })
  @Post()
  @ApiBody({ type: CreateProductDto })
  create(@Body() dto: CreateProductDto): Promise<Product> {
    return this.productsService.create(dto);
  }

  @ApiOperation({ summary: 'Обновить продукт' })
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, dto);
  }

  @ApiOperation({ summary: 'Удалить продукт (soft delete)' })
  @HttpCode(204)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productsService.remove(id);
  }

  /* ========= VARIANTS (nested) ========= */

  @ApiOperation({ summary: 'Список вариантов продукта' })
  @Get(':productId/variants')
  listVariants(
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<ProductVariant[]> {
    return this.productsService.listVariants(productId);
  }

  @ApiOperation({ summary: 'Создать вариант продукта' })
  @Post(':productId/variants')
  @ApiBody({ type: CreateVariantForProductDto })
  createVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateVariantForProductDto,
  ): Promise<ProductVariant> {
    return this.productsService.createVariant(productId, dto);
  }

  @ApiOperation({ summary: 'Получить вариант продукта' })
  @Get(':productId/variants/:variantId')
  getVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<ProductVariant> {
    return this.productsService.getVariant(productId, variantId);
  }

  @ApiOperation({ summary: 'Обновить вариант продукта' })
  @Patch(':productId/variants/:variantId')
  updateVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    return this.productsService.updateVariant(productId, variantId, dto);
  }

  @ApiOperation({ summary: 'Удалить вариант продукта (soft delete)' })
  @HttpCode(204)
  @Delete(':productId/variants/:variantId')
  async removeVariant(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('variantId', ParseUUIDPipe) variantId: string,
  ): Promise<void> {
    await this.productsService.removeVariant(productId, variantId);
  }
}

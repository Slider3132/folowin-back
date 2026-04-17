// Hot reload trigger
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { Product } from 'src/modules/products/entities/product.entity';
import { PageDto } from '@/common/dto';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFilterDto } from './dto/category-filter.dto';
import { Category } from './entities/category.entity';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({
    summary: 'Отримати всі категорії з пагінацією та фільтрацією',
  })
  @ApiResponse({
    status: 200,
    description: 'Список категорій з пагінацією',
    type: PageDto<Category>,
  })
  @Get()
  findAll(@Query() filterDto: CategoryFilterDto): Promise<PageDto<Category>> {
    return this.categoriesService.findAll(filterDto);
  }


  @ApiOperation({ summary: 'Отримати каскадне дерево категорій (всі рівні)' })
  @ApiResponse({
    status: 200,
    description: 'Повне дерево категорій з усіма підкатегоріями',
    type: PageDto<Category>,
  })
  @Get('/tree/cascade')
  findTreeCascade(@Query() filterDto: CategoryFilterDto): Promise<PageDto<Category>> {
    return this.categoriesService.findTreeCascade(filterDto);
  }

  @ApiOperation({ summary: 'Отримати дерево категорій (root + children)' })
  @ApiResponse({
    status: 200,
    description: 'Дерево категорій',
    type: [Category],
  })
  @Get('/tree')
  findTree(): Promise<Category[]> {
    return this.categoriesService.findTree();
  }

  @ApiOperation({ summary: 'Отримати підкатегорії' })
  @ApiResponse({
    status: 200,
    description: 'Список підкатегорій',
    type: [Category],
  })
  @Get(':id/children')
  findChildren(@Param('id') id: string): Promise<Category[]> {
    return this.categoriesService.findChildren(id);
  }

  @ApiOperation({ summary: 'Отримати шлях від кореня до категорії' })
  @ApiResponse({
    status: 200,
    description: 'Шлях категорій від кореня до вказаної',
    type: [Category],
  })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено' })
  @Get(':id/path')
  getCategoryPath(@Param('id') id: string): Promise<Category[]> {
    return this.categoriesService.getCategoryPath(id);
  }

  @ApiOperation({ summary: 'Отримати категорію по id' })
  @ApiResponse({
    status: 200,
    description: 'Категорія знайдена',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено' })
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findOne(id);
  }

  @ApiOperation({ summary: 'Отримати категорію по slug' })
  @ApiResponse({
    status: 200,
    description: 'Категорія знайдена',
    type: Category,
  })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено' })
  @Get('/slug/:slug')
  findBySlug(@Param('slug') slug: string): Promise<Category> {
    return this.categoriesService.findBySlug(slug);
  }

  @ApiOperation({ summary: 'Створити категорію' })
  @ApiResponse({
    status: 201,
    description: 'Категорію успішно створено',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Некоректні дані' })
  @Post()
  create(@Body() data: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(data);
  }

  @ApiOperation({ summary: 'Оновити категорію' })
  @ApiResponse({
    status: 200,
    description: 'Категорію успішно оновлено',
    type: Category,
  })
  @ApiResponse({ status: 400, description: 'Некоректні дані' })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, data);
  }

  @ApiOperation({ summary: 'Видалити категорію (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Категорію успішно видалено',
  })
  @ApiResponse({ status: 404, description: 'Категорію не знайдено' })
  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }

  @ApiOperation({
    summary: 'Отримати всі продукти з категорії та всіх підкатегорій',
  })
  @ApiResponse({
    status: 200,
    description: 'Список продуктів',
    type: [Product],
  })
  @Get(':id/products')
  getAllProducts(
    @Param('id') categoryId: string,
    @Query('onlyActive', new ParseBoolPipe({ optional: true })) onlyActive?: boolean,
  ): Promise<Product[]> {
    return this.categoriesService.getAllProducts(categoryId, onlyActive);
  }
}

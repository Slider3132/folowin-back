import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import slugify from 'slugify';
import { Product } from 'src/modules/products/entities/product.entity';
import { ILike, In, IsNull, Repository } from 'typeorm';
import { PageDto, PageMetaDto } from '@/common/dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryFilterDto } from './dto/category-filter.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // Получить все категории с пагинацией и фильтрацией
  async findAll(filterDto: CategoryFilterDto): Promise<PageDto<Category>> {
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parent', 'parent')
      .leftJoinAndSelect('category.children', 'children')
      .leftJoinAndSelect('category.media', 'media')
      .where('category.deletedAt IS NULL');

    // Фильтр по поиску
    if (filterDto.search) {
      queryBuilder.andWhere(
        '(category.name ILIKE :search OR category.description ILIKE :search)',
        { search: `%${filterDto.search}%` },
      );
    }

    // Фильтр по активности
    if (filterDto.isActive !== undefined) {
      queryBuilder.andWhere('category.isActive = :isActive', {
        isActive: filterDto.isActive,
      });
    }

    // Фильтр по родительской категории
    if (filterDto.parentId !== undefined) {
      if (filterDto.parentId === null) {
        queryBuilder.andWhere('category.parent IS NULL');
      } else {
        queryBuilder.andWhere('category.parent.id = :parentId', {
          parentId: filterDto.parentId,
        });
      }
    }

    // Сортировка
    const sortBy = filterDto.sortBy || 'order';
    const order = filterDto.order || 'ASC';
    queryBuilder.orderBy(`category.${sortBy}`, order as 'ASC' | 'DESC');

    // Пагинация
    queryBuilder.skip(filterDto.skip).take(filterDto.limit);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: filterDto,
      itemCount,
    });

    return new PageDto(entities, pageMetaDto);
  }

  // Получить по id
  findOne(id: string): Promise<Category> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'media'],
    });
  }

  // Получить по slug
  findBySlug(slug: string): Promise<Category> {
    return this.categoryRepository.findOne({
      where: { slug },
      relations: ['parent', 'children', 'media'],
    });
  }

  // Получить путь от корня до категории
  async getCategoryPath(categoryId: string): Promise<Category[]> {
    const path: Category[] = [];
    let currentId: string | null = categoryId;

    while (currentId) {
      const category = await this.categoryRepository.findOne({
        where: { id: currentId },
        relations: ['parent'],
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }

      path.unshift(category); // Add to beginning of array
      currentId = category.parent?.id || null;
    }

    return path;
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const slug = slugify(dto.name, { lower: true });

    const existing = await this.categoryRepository.findOne({ where: { slug } });
    if (existing) {
      throw new BadRequestException(
        `Категорія з такою назвою вжу існує (slug: "${dto.name}")`,
      );
    }

    const parent = dto.parentId
      ? await this.categoryRepository.findOne({ where: { id: dto.parentId } })
      : null;

    const category = this.categoryRepository.create({
      ...dto,
      slug,
      parent,
    });

    return this.categoryRepository.save(category);
  }

  // Обновить
  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    if (!category) {
      throw new BadRequestException('Категорію не знайдено');
    }

    const { parentId, ...updateData } = dto;

    // Обработка родительской категории
    if (parentId !== undefined) {
      category.parent = parentId
        ? await this.categoryRepository.findOne({ where: { id: parentId } })
        : null;
    }

    Object.assign(category, updateData);

    return this.categoryRepository.save(category);
  }

  // Удалить (soft delete)
  async remove(id: string): Promise<void> {
    await this.categoryRepository.softDelete(id);
  }

  // Получить подкатегории
  async findChildren(id: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { parent: { id } },
      relations: ['children', 'media'],
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  // Получить дерево категорий (старый метод - только первый уровень детей)
  async findTree(): Promise<Category[]> {
    // root-категории
    const roots = await this.categoryRepository.find({
      where: { parent: IsNull() },
      relations: ['children', 'media', 'parent'],
      order: { order: 'ASC', name: 'ASC' },
    });
    return roots;
  }

  // Рекурсивно загрузить всех детей
  private async loadCategoryChildren(category: Category): Promise<Category> {
    const children = await this.categoryRepository.find({
      where: { parent: { id: category.id } },
      relations: ['media', 'parent'],
      order: { order: 'ASC', name: 'ASC' },
    });

    if (children.length > 0) {
      category.children = await Promise.all(
        children.map(child => this.loadCategoryChildren(child))
      );
    }

    return category;
  }

  // Получить дерево категорий с каскадной загрузкой всех подкатегорий

  async findTreeCascade(filterDto?: CategoryFilterDto): Promise<PageDto<Category>> {
    const allCategories = await this.categoryRepository.find({
      relations: ['parent', 'media', 'children'],
      order: { order: 'ASC', name: 'ASC' },
    });

    const categoryMap = new Map<string, Category>();

    const nodes = allCategories.map(cat => {
      cat.children = [];
      categoryMap.set(cat.id, cat);
      return cat;
    });

    const roots: Category[] = [];

    nodes.forEach(cat => {
      if (cat.parent) {
        const parent = categoryMap.get(cat.parent.id);
        if (parent) {
          parent.children.push(cat);
        } else {
          roots.push(cat);
        }
      } else {
        roots.push(cat);
      }
    });

    let result = roots;

    if (filterDto?.search) {
      const lowerQuery = filterDto.search.toLowerCase();

      const filterNodes = (list: Category[]): Category[] => {
        return list.reduce((acc, node) => {
          const matchesSelf =
            node.name.toLowerCase().includes(lowerQuery) ||
            (node.description && node.description.toLowerCase().includes(lowerQuery)) ||
            node.slug.toLowerCase().includes(lowerQuery);

          const filteredChildren = node.children && node.children.length > 0
            ? filterNodes(node.children)
            : [];

          if (matchesSelf || filteredChildren.length > 0) {
            if (!matchesSelf) {
              const newNode = { ...node };
              newNode.children = filteredChildren;
              acc.push(newNode);
            } else {
              acc.push(node);
            }
          }
          return acc;
        }, [] as Category[]);
      };

      result = filterNodes(result);
    }
    
    if (filterDto?.sortBy) {
      const { sortBy, order = 'ASC' } = filterDto;
      
      const sortNodes = (list: Category[]) => {
        list.sort((a, b) => {
          let aVal: any = a[sortBy];
          let bVal: any = b[sortBy];
          
          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();
          
          if (aVal < bVal) return order === 'ASC' ? -1 : 1;
          if (aVal > bVal) return order === 'ASC' ? 1 : -1;
          return 0;
        });
        
        list.forEach(node => {
          if (node.children?.length) {
            sortNodes(node.children);
          }
        });
      };
      
      sortNodes(result);
    } else {
        const sortDefault = (list: Category[]) => {
            list.sort((a,b) => a.order - b.order);
            list.forEach(n => { if(n.children?.length) sortDefault(n.children); });
        };
        sortDefault(result);
    }

    // 5. Pagination
    const itemCount = result.length;
    
    // Check if filterDto has pagination params, otherwise default
    const pageOptionsDto = filterDto || ({ page: 1, limit: 10 } as CategoryFilterDto);
    const page = pageOptionsDto.page || 1;
    const limit = pageOptionsDto.limit || 10;
    const skip = (page - 1) * limit;

    const data = result.slice(skip, skip + limit);

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });

    return new PageDto(data, pageMetaDto);
  }

  // Получить все id подкатегорий (рекурсивно)
  // Получить все id подкатегорий (рекурсивно через CTE)
  // Получить все id подкатегорий (рекурсивно)
  async getAllCategoryIds(categoryId: string): Promise<string[]> {
    const allCategories = await this.categoryRepository.find({
      select: ['id', 'parent'],
      relations: ['parent'],
    });

    const findAllChildren = (targetId: string): string[] => {
      const children = allCategories
        .filter((cat) => cat.parent?.id === targetId)
        .map((cat) => cat.id);
      
      let allChildren = [...children];
      children.forEach((childId) => {
        allChildren = [...allChildren, ...findAllChildren(childId)];
      });
      
      return allChildren;
    };

    const ids = findAllChildren(categoryId);
    return [categoryId, ...ids];
  }

  // Получить все продукты из категории и всех подкатегорий
  async getAllProducts(
    categoryId: string,
    onlyActive = true,
  ): Promise<Product[]> {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: ['children'],
    });

    if (!category) {
      throw new BadRequestException('Категорія не знайдена');
    }

    const categoryIds = await this.getAllCategoryIds(categoryId);
    return this.productRepo.find({
      where: {
        category: { id: In(categoryIds) },
        ...(onlyActive ? { isActive: true } : {}),
      },
      relations: ['variants', 'media'],
    });
  }
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Media } from 'src/modules/media/entities/media.entity';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductVariant } from './entities/product-variant.entity';
import { Product } from './entities/product.entity';
import { AvailabilityStatus, ProductStatus } from './entities/product.enums';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepository: Repository<ProductVariant>,
    @InjectRepository(Media)
    private readonly mediaRepository: Repository<Media>,
    private readonly dataSource: DataSource,
  ) {}

  /* =======================
     PRODUCTS
     ======================= */

  async findAllWithPagination(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: ProductStatus,
    availability?: AvailabilityStatus, // availability enum type
    categoryId?: string,
  ): Promise<{ data: Product[]; total: number }> {
    const skip = (page - 1) * limit;
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder
      .leftJoinAndSelect('product.media', 'media')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.media', 'variantMedia')
      .leftJoinAndSelect('product.category', 'category')
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('product.status = :status', { status });
    }

    if (availability) {
      queryBuilder.andWhere('product.availability = :availability', {
        availability,
      });
    }

    if (categoryId) {
      queryBuilder.andWhere('product.category.id = :categoryId', {
        categoryId,
      });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['media', 'variants', 'variants.media'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    return this.dataSource.transaction(async (manager) => {
      const productsRepo = manager.getRepository(Product);
      const mediaRepo = manager.getRepository(Media);

      const productToCreate = productsRepo.create({
        ...dto,
        status: dto.status ?? ProductStatus.DRAFT,
        media: dto.mediaIds
          ? await mediaRepo.find({ where: { id: In(dto.mediaIds) } })
          : [],
      });

      let product: Product;
      try {
        product = await productsRepo.save(productToCreate);
      } catch (e: any) {
        if (e?.code === '23505') {
          throw new BadRequestException('Продукт с таким SKU уже существует');
        }
        throw e;
      }

      if (dto.variants && dto.variants.length > 0) {
        for (const variantDto of dto.variants) {
          await this.createVariantInTransaction(manager, product, variantDto);
        }
      } else {
        await this.createVariantInTransaction(manager, product, {
          name: product.name,
          price: 0,
          purchasePrice: 0,
          stock: 0,
          minOrderQuantity: product.minOrderQuantity ?? 1,
          orderStep: product.orderStep ?? 1,
          isActive: true,
        } as Omit<CreateProductVariantDto, 'productId'>);
      }

      return manager.getRepository(Product).findOne({
        where: { id: product.id },
        relations: ['media', 'variants', 'variants.media'],
      }) as Promise<Product>;
    });
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    return this.dataSource.transaction(async (manager) => {
      const productsRepo = manager.getRepository(Product);
      const mediaRepo = manager.getRepository(Media);

      const product = await productsRepo.findOne({
        where: { id },
        relations: ['media'],
      });
      if (!product) throw new NotFoundException('Product not found');

      Object.assign(product, dto);

      if (dto.mediaIds) {
        product.media = await mediaRepo.find({
          where: { id: In(dto.mediaIds) },
        });
      }

      await productsRepo.save(product);

      return manager.getRepository(Product).findOne({
        where: { id },
        relations: ['media', 'variants', 'variants.media'],
      }) as Promise<Product>;
    });
  }

  async remove(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.productRepository.softDelete(id);
  }

  /* =======================
     VARIANTS (nested under product)
     ======================= */

  async listVariants(productId: string): Promise<ProductVariant[]> {
    return this.variantRepository.find({
      where: { productId },
      relations: ['media'],
      order: { createdAt: 'DESC' },
    });
  }

  async getVariant(
    productId: string,
    variantId: string,
  ): Promise<ProductVariant> {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId, productId },
      relations: ['media'],
    });
    if (!variant) throw new NotFoundException('Variant not found');
    return variant;
  }

  async createVariant(
    productId: string,
    dto: Omit<CreateProductVariantDto, 'productId'>,
  ): Promise<ProductVariant> {
    return this.dataSource.transaction(async (manager) => {
      const productsRepo = manager.getRepository(Product);
      const product = await productsRepo.findOne({
        where: { id: productId },
        relations: ['variants'],
      });
      if (!product) throw new NotFoundException('Product not found');

      const saved = await this.createVariantInTransaction(
        manager,
        product,
        dto,
      );

      return manager.getRepository(ProductVariant).findOne({
        where: { id: saved.id },
        relations: ['media'],
      }) as Promise<ProductVariant>;
    });
  }

  async updateVariant(
    productId: string,
    variantId: string,
    dto: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    return this.dataSource.transaction(async (manager) => {
      const variantsRepo = manager.getRepository(ProductVariant);
      const mediaRepo = manager.getRepository(Media);

      const variant = await variantsRepo.findOne({
        where: { id: variantId, productId },
      });
      if (!variant) throw new NotFoundException('Variant not found');

      try {
        await variantsRepo.update(variantId, {
          name: dto.name ?? variant.name,
          sku: dto.sku ?? variant.sku,
          price: dto.price ?? variant.price,
          purchasePrice: dto.purchasePrice ?? variant.purchasePrice,
          stock: dto.stock ?? variant.stock,
          attributes: dto.attributes ?? variant.attributes,
          unit: dto.unit ?? variant.unit,
          minOrderQuantity: dto.minOrderQuantity ?? variant.minOrderQuantity,
          orderStep: dto.orderStep ?? variant.orderStep,
          isActive: dto.isActive ?? variant.isActive,
          order: dto.order ?? variant.order,
        });
      } catch (e: any) {
        if (e?.code === '23505') {
          throw new BadRequestException(
            'Вариант с таким SKU или именем уже существует для этого продукта',
          );
        }
        throw e;
      }

      if (dto.mediaIds) {
        await mediaRepo.update(
          { productVariant: { id: variantId } },
          { productVariant: { id: null } },
        );
        if (dto.mediaIds.length > 0) {
          await mediaRepo.update(
            { id: In(dto.mediaIds) },
            { productVariant: { id: variantId } },
          );
        }
      }

      return manager.getRepository(ProductVariant).findOne({
        where: { id: variantId },
        relations: ['media'],
      }) as Promise<ProductVariant>;
    });
  }

  async removeVariant(productId: string, variantId: string): Promise<void> {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId, productId },
    });
    if (!variant) throw new NotFoundException('Variant not found');
    await this.variantRepository.softDelete(variantId);
  }

  /* =======================
     INTERNAL
     ======================= */

  private async createVariantInTransaction(
    manager: EntityManager,
    product: Product,
    dto: Omit<CreateProductVariantDto, 'productId'>,
  ): Promise<ProductVariant> {
    const variantsRepo = manager.getRepository(ProductVariant);
    const mediaRepo = manager.getRepository(Media);

    const variantToCreate = variantsRepo.create({
      ...dto,
      productId: product.id,
      stock: dto.stock ?? 0,
      minOrderQuantity: dto.minOrderQuantity ?? product.minOrderQuantity ?? 1,
      orderStep: dto.orderStep ?? product.orderStep ?? 1,
      isActive: dto.isActive ?? true,
    });

    let variant: ProductVariant;
    try {
      variant = await variantsRepo.save(variantToCreate);
    } catch (e: any) {
      if (e?.code === '23505') {
        throw new BadRequestException(
          'Вариант с таким SKU или именем уже существует для этого продукта',
        );
      }
      throw e;
    }

    if (dto.mediaIds && dto.mediaIds.length > 0) {
      await mediaRepo.update(
        { id: In(dto.mediaIds) },
        { productVariant: { id: variant.id } },
      );
    }

    return variant;
  }
}

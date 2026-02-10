import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { path } from 'app-root-path';
import { existsSync, unlinkSync } from 'fs-extra';
import { DeepPartial, Repository } from 'typeorm';
import { CreateMediaDto } from './dto/create-media.dto';
import { Media } from './entities/media.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
  ) {}

  // Получить список медиа
  findAll(): Promise<Media[]> {
    return this.mediaRepo.find({ order: { createdAt: 'DESC' } });
  }

  // Получить медиа по id
  findOne(id: string): Promise<Media> {
    return this.mediaRepo.findOne({ where: { id } });
  }

  // Создать медиа (универсально для любого типа объекта)
  async create(data: DeepPartial<Media>): Promise<Media> {
    const media = this.mediaRepo.create(data);
    return this.mediaRepo.save(media);
  }

  // Обновить медиа
  async update(id: string, data: Partial<Media>): Promise<Media> {
    await this.mediaRepo.update(id, data);
    return this.findOne(id);
  }

  // Удалить медиа и физический файл (если url задан)
  async remove(id: string): Promise<void> {
    const media = await this.findOne(id);
    if (!media) throw new NotFoundException('Media not found');

    if (media.url) {
      const relativeUrl = media.url.replace('/api/public', '');
      const filePath = `${path}/public${relativeUrl}`;
      if (existsSync(filePath)) {
        try {
          unlinkSync(filePath);
        } catch (error) {
          console.error(`Failed to delete file: ${filePath}`, error);
        }
      }
    }

    await this.mediaRepo.softDelete(id);
  }

  // Получить все медиа для категории
  findByCategory(categoryId: string): Promise<Media[]> {
    return this.mediaRepo.find({
      where: { category: { id: categoryId } },
      order: { createdAt: 'DESC' },
    });
  }

  // Получить все медиа для продукта
  findByProduct(productId: string): Promise<Media[]> {
    return this.mediaRepo.find({
      where: { product: { id: productId } },
      order: { createdAt: 'DESC' },
    });
  }

  // Получить все медиа для варианта продукта
  findByProductVariant(productVariantId: string): Promise<Media[]> {
    return this.mediaRepo.find({
      where: { productVariant: { id: productVariantId } },
      order: { createdAt: 'DESC' },
    });
  }
}

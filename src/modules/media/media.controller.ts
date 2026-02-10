import { FileFolders } from '@/common/consts/file-folders';
import { UploadFileInterceptor } from '@/interceptors/upload-file.interceptor';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateMediaDto } from './dto/create-media.dto';
import { Media } from './entities/media.entity';
import { MediaService } from './media.service';

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @ApiOperation({ summary: 'Список всех медиа-файлов' })
  @Get()
  findAll(): Promise<Media[]> {
    return this.mediaService.findAll();
  }

  @ApiOperation({ summary: 'Инфо о медиа-файле по id' })
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Media> {
    return this.mediaService.findOne(id);
  }

  @ApiOperation({ summary: 'Загрузить файл' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string', example: 'image' },
        order: { type: 'number', example: 1 },
      },
    },
  })
  @Post('upload/category/:categoryId')
  @UseInterceptors(
    UploadFileInterceptor({
      fieldName: 'file',
      mainFolderName: FileFolders.categories,
    }),
  )
  async uploadCategoryImage(
    @Param('categoryId') categoryId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateMediaDto,
  ): Promise<Media> {
    if (!file) throw new BadRequestException('Файл обязателен');

    const existingMedia = await this.mediaService.findByCategory(categoryId);
    for (const media of existingMedia) {
      await this.mediaService.remove(media.id);
    }

    const url = `/api/public/uploads/categories/${file.filename}`;
    return this.mediaService.create({
      ...body,
      url,
      category: { id: categoryId },
    });
  }

  @Post('upload/product/:productId')
  @UseInterceptors(
    UploadFileInterceptor({
      fieldName: 'file',
      mainFolderName: FileFolders.products,
    }),
  )
  async uploadProductImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateMediaDto,
  ): Promise<Media> {
    if (!file) throw new BadRequestException('Файл обязателен');
    const url = `/api/public/uploads/products/${file.filename}`;
    return this.mediaService.create({
      ...body,
      url,
      product: { id: productId },
    });
  }

  @Post('upload/variant/:variantId')
  @UseInterceptors(
    UploadFileInterceptor({
      fieldName: 'file',
      mainFolderName: FileFolders.variants,
    }),
  )
  async uploadVariantImage(
    @Param('variantId') variantId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateMediaDto,
  ): Promise<Media> {
    if (!file) throw new BadRequestException('Файл обязателен');
    const url = `/api/public/uploads/variants/${file.filename}`;
    return this.mediaService.create({
      ...body,
      url,
      productVariant: { id: variantId },
    });
  }
}

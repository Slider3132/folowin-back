import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';
import { PageOptionsDto } from '@/common/dto';

export class CategoryFilterDto extends PageOptionsDto {
  @ApiPropertyOptional({
    description: 'Поиск по названию или описанию категории',
    example: 'сыр',
  })
  @IsString()
  @IsOptional()
  readonly search?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по активности категории',
    example: true,
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Фильтр по родительской категории (null - только корневые)',
    example: '8fae2c4e-...-4a7e',
  })
  @Transform(({ value }) => {
    if (value === 'null') return null;
    return value;
  })
  @IsUUID()
  @IsOptional()
  readonly parentId?: string | null;

  @ApiPropertyOptional({
    description: 'Поле для сортировки',
    example: 'name',
    enum: ['name', 'createdAt', 'updatedAt', 'order'],
  })
  @IsString()
  @IsOptional()
  readonly sortBy?: string = 'order';
}

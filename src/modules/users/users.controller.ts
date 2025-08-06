import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseFilePipe,
  Patch,
  SerializeOptions,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileFolders } from '../../common/consts/file-folders';
import { UploadFileInterceptor } from '../../interceptors/upload-file.interceptor';
import { ExceptionSchema } from '../../schemas/response/response.schema';
import { UserDecorator } from './decorators/user.decorator';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { AuthorizedUserType } from './types/authorized-user.type';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({ type: User })
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get('me')
  @ApiOkResponse({
    description: 'Successful',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: ExceptionSchema,
  })
  async me(@UserDecorator() { id }: AuthorizedUserType): Promise<User> {
    return this.service.find(id, true);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Successful',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: ExceptionSchema,
  })
  async find(@Param('id') id: string): Promise<User> {
    return this.service.find(id);
  }

  @Patch()
  @ApiOkResponse({
    description: 'Successful',
    type: User,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
    schema: ExceptionSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: ExceptionSchema,
  })
  @UseInterceptors(
    UploadFileInterceptor({
      fieldName: 'avatar',
      mainFolderName: FileFolders.users,
    }),
  )
  async update(
    @UserDecorator() { id }: AuthorizedUserType,
    @Body() dto: UserDto,
    @UploadedFile(new ParseFilePipe({ fileIsRequired: false }))
    file: Express.Multer.File,
  ): Promise<User> {
    return this.service.update(id, { ...dto, avatar: file?.filename });
  }

  @Delete()
  @ApiOkResponse({
    description: 'Successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: ExceptionSchema,
  })
  async delete(@UserDecorator() { id }: AuthorizedUserType): Promise<void> {
    await this.service.delete(id);
  }

  @Patch('restore')
  @ApiOkResponse({
    description: 'Successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: ExceptionSchema,
  })
  async restore(@UserDecorator() { id }: AuthorizedUserType): Promise<void> {
    await this.service.restore(id);
  }
}

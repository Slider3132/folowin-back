import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ExceptionSchema } from 'src/schemas/response/response.schema';
import { UserDecorator } from '../users/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthorizedUserType } from '../users/types/authorized-user.type';
import { AuthService } from './auth.service';
import { RefreshTokenDecorator } from './decorators/refresh-token.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth.guard';
import { AuthOKSchema } from './schemas/register.schema';
import { AuthResponseType } from './types/auth-response.type';

@ApiTags('Authentication')
@Controller('authentication')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success',
    schema: AuthOKSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  async register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }

  @Post('facebook')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success',
    schema: AuthOKSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success',
    schema: AuthOKSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  async google(@Body() dto: GoogleAuthDto): Promise<AuthResponseType> {
    return this.service.google(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success',
    schema: AuthOKSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  async login(@Body() dto: LoginDto): Promise<AuthResponseType> {
    return this.service.login(dto);
  }

  @Get('refresh')
  @ApiOkResponse({
    description: 'Successful',
    schema: AuthOKSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: ExceptionSchema,
  })
  @UseGuards(RefreshAuthGuard)
  async refreshTokens(
    @RefreshTokenDecorator() refreshToken: string,
  ): Promise<AuthResponseType> {
    return this.service.refresh(refreshToken);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'Success',
    type: User,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @UserDecorator() user: AuthorizedUserType,
  ): Promise<User> {
    return this.service.changePassword(dto, user);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    schema: ExceptionSchema,
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<AuthResponseType> {
    return this.service.resetPassword(dto);
  }
}

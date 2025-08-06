import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { compare, genSalt, hash } from 'bcryptjs';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { RolesEnum } from '../users/enums/roles.enum';
import { AuthorizedUserType } from '../users/types/authorized-user.type';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerificationCode } from './entities/verification.entity';
import { AuthResponseType } from './types/auth-response.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(VerificationCode)
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register({
    email,
    role,
    ...dto
  }: RegisterDto): Promise<AuthResponseType> {
    const existsUser = await this.userRepository.findOne({
      where: { email },
      withDeleted: true,
    });

    if (existsUser) {
      throw new UnauthorizedException('User already exists');
    }

    const user = await this.userRepository.save({
      email,
      roles: [role],
      ...dto,
    });

    return { ...(await this.generateTokens(user)) };
  }

  async login({
    email,
    password,
    remember,
  }: LoginDto): Promise<AuthResponseType> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: [],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { ...(await this.generateTokens(user, remember)) };
  }

  async google({ token, remember }: GoogleAuthDto): Promise<AuthResponseType> {
    const { data } = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!data) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { email } = data;

    let user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      user = await this.userRepository.save({
        email,
        isEmailVerified: true,
        roles: [RolesEnum.guest],
      });
    }

    return { ...(await this.generateTokens(user, remember)) };
  }

  async refresh(refreshToken: string): Promise<AuthResponseType> {
    const { id }: any = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
    });

    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return { ...(await this.generateTokens(user)) };
  }

  async changePassword(
    { currentPassword, password }: ChangePasswordDto,
    user: AuthorizedUserType,
  ): Promise<User> {
    const existUser = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!(await compare(currentPassword, existUser.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.userRepository.save({
      id: user.id,
      password: await hash(password, await genSalt(10)),
    });

    return existUser;
  }

  async resetPassword({
    email,
    password,
  }: ResetPasswordDto): Promise<AuthResponseType> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    await this.userRepository.save({
      id: user.id,
      password: await hash(password, await genSalt(10)),
    });

    return { ...(await this.generateTokens(user)) };
  }

  private async generateTokens(
    user: User,
    remember: boolean = false,
  ): Promise<AuthResponseType> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          id: user.id,
          email: user.email,
          roles: user.roles,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: remember
            ? '30d'
            : this.configService.getOrThrow<string>('JWT_SECRET_EXPIRED'),
        },
      ),
      this.jwtService.signAsync(
        {
          id: user.id,
          email: user.email,
          roles: user.roles,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_REFRESH_SECRET_EXPIRED',
          ),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}

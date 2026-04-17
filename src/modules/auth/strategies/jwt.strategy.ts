import { UsersService } from '@/modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const userId: string | undefined = payload?.sub ?? payload?.id;
    if (!userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const freshUser = await this.usersService.find(userId);

    if (!freshUser) {
      throw new UnauthorizedException('User not found');
    }

    return freshUser;
  }
}

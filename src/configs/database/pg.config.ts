import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getPostgresConfig = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [`${__dirname}/../../modules/**/entities/*.{ts,js}`],
    migrations: [`${__dirname}/../../migrations/**.{ts,js}`],
    subscribers: [`${__dirname}/../../modules/**/subscribers/**.{ts,js}`],
    migrationsTableName: 'migrations',
    synchronize: false,
    autoLoadEntities: false,
  };
};

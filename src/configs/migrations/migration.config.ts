import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [`${__dirname}/../../modules/**/entities/*.{ts,js}`],
  migrations: [`${__dirname}/../../migrations/**.{ts,js}`],
  subscribers: [`${__dirname}/../../modules/**/subscribers/**.{ts,js}`],
  migrationsTableName: 'migrations',
  synchronize: false,
});

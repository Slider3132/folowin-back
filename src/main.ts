import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { path } from 'app-root-path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule);

  const configService: ConfigService = app.get(ConfigService);
  const PORT = configService.get<number>('HOST_PORT') ?? 3001;

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Folowin API')
    .setDescription('Documentation for Folowin backend')
    .addServer('/api')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useStaticAssets(`${path}/public`, {
    index: false,
    prefix: '/public/',
  });

  app.setGlobalPrefix('api');

  await app.listen(PORT);
}
bootstrap();

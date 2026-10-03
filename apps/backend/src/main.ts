import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);
    const apiPrefix = configService.getOrThrow<string>('API_PREFIX');

    // Em produção a API roda atrás do proxy do Render; sem isso, o limite de login enxergaria um único IP.
    if (configService.getOrThrow<string>('NODE_ENV') === 'production') app.set('trust proxy', 1);
    if (apiPrefix) app.setGlobalPrefix(apiPrefix);

    app.enableCors({
        origin: configService.getOrThrow<string[]>('CORS_ORIGINS'),
        credentials: true,
    });
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.listen(configService.getOrThrow<number>('PORT'), '0.0.0.0');
}

void bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

// Rede de segurança: um erro JS que escape de algum callback (ex.: impressora)
// fica no log em vez de derrubar a API em silêncio.
const processLogger = new Logger('Process');
process.on('uncaughtException', (error) => {
  processLogger.error('Exceção não tratada:', error?.stack ?? error);
});
process.on('unhandledRejection', (reason) => {
  processLogger.error('Promise rejeitada sem tratamento:', reason instanceof Error ? reason.stack : reason);
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();

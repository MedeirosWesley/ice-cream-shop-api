import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { env } from './modules/config/env';

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
  // Conexões SSE ficam abertas; sem isso o app.close() nunca termina e o
  // start-api.bat não reinicia a API.
  const app = await NestFactory.create(AppModule, { forceCloseConnections: true });
  app.useGlobalPipes(new ValidationPipe());

  app.enableShutdownHooks();

  await app.listen(env.port);
}
bootstrap();

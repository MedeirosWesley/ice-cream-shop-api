import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CatalogEventsInterceptor } from './catalog-events.interceptor';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Global()
@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    { provide: APP_INTERCEPTOR, useClass: CatalogEventsInterceptor },
  ],
  exports: [EventsService],
})
export class EventsModule { }

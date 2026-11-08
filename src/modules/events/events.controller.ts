import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { Observable, defer, interval, map, merge, of } from 'rxjs';
import { EventsService, ServerEvent } from './events.service';

export const PING_INTERVAL_MS = 15000;

const systemEvent = (type: string): ServerEvent => ({
  type,
  data: { at: new Date().toISOString() },
});

// Rota de topo: dentro de /order seria capturada por @Get(':type').
@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Sse('events')
  events(): Observable<MessageEvent> {
    return merge(
      defer(() => of(systemEvent('hello'))),
      this.eventsService.stream,
      interval(PING_INTERVAL_MS).pipe(map(() => systemEvent('ping'))),
    ).pipe(map((event) => ({ data: event })));
  }
}

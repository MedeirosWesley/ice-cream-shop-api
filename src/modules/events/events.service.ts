import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';

export type OrderChangeAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'paid'
  | 'closed'
  | 'merged'
  | 'route';

export interface ServerEvent {
  type: string;
  data: Record<string, unknown>;
}

/** Canal único dos avisos enviados aos apps conectados em GET /events. */
@Injectable()
export class EventsService {
  private readonly events$ = new Subject<ServerEvent>();

  get stream(): Observable<ServerEvent> {
    return this.events$.asObservable();
  }

  /** `orderType` nulo faz o app recarregar as duas listas. */
  orderChanged(
    orderType: string | null,
    orderId: string | null,
    action: OrderChangeAction,
  ): void {
    this.events$.next({
      type: 'order.changed',
      data: { orderType, orderId, action, at: new Date().toISOString() },
    });
  }

  catalogChanged(dataset: string): void {
    this.events$.next({
      type: 'catalog.changed',
      data: { dataset, at: new Date().toISOString() },
    });
  }
}

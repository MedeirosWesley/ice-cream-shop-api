import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { EventsService } from './events.service';

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// Chave: início do caminho da rota. Valor: ids de conjunto usados pelo app.
const DATASETS_BY_ROUTE: Record<string, string[]> = {
  additional: ['additional'],
  'ice-cream-flavors': ['flavors'],
  'ice-cream-sizes': ['sizes'],
  'ice-cream-syrups': ['syrups'],
  popsicles: ['popsicles'],
  drinks: ['drinks'],
  'on-sale-acai': ['on_sale', 'top_store', 'top_delivery'],
  'other-product': ['other_product'],
  clients: ['clients'],
  'motorcycle-couriers': ['couriers'],
  'settings/delivery-fee': ['delivery_fee'],
};

export function datasetsForPath(path: string): string[] {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const route = Object.keys(DATASETS_BY_ROUTE).find(
    (prefix) => clean === prefix || clean.startsWith(`${prefix}/`),
  );
  return route ? DATASETS_BY_ROUTE[route] : [];
}

/** Avisa os apps depois de cada escrita bem-sucedida em rotas de catálogo. */
@Injectable()
export class CatalogEventsInterceptor implements NestInterceptor {
  constructor(private readonly eventsService: EventsService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    if (!WRITE_METHODS.has(request?.method)) {
      return next.handle();
    }

    const datasets = datasetsForPath(request.path ?? '');
    return next.handle().pipe(
      tap(() => datasets.forEach((dataset) => this.eventsService.catalogChanged(dataset))),
    );
  }
}

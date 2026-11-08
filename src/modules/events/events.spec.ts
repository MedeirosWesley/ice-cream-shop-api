import { firstValueFrom, of, take, toArray } from 'rxjs';
import { CatalogEventsInterceptor, datasetsForPath } from './catalog-events.interceptor';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('events', () => {
  it('sends hello first, then live events as one JSON object', async () => {
    const service = new EventsService();
    const received = firstValueFrom(new EventsController(service).events().pipe(take(2), toArray()));

    service.orderChanged('Store', 'order-1', 'created');

    const [hello, change] = (await received) as any[];
    expect(hello.data.type).toBe('hello');
    expect(typeof hello.data.data.at).toBe('string');
    expect(change.data.type).toBe('order.changed');
    expect(change.data.data).toMatchObject({ orderType: 'Store', orderId: 'order-1', action: 'created' });
  });

  it('maps routes to dataset ids', () => {
    expect(datasetsForPath('/ice-cream-sizes/abc')).toEqual(['sizes']);
    expect(datasetsForPath('/settings/delivery-fee')).toEqual(['delivery_fee']);
    expect(datasetsForPath('/on-sale-acai')).toEqual(['on_sale', 'top_store', 'top_delivery']);
    expect(datasetsForPath('/order')).toEqual([]);
    expect(datasetsForPath('/on-sale-acai-order')).toEqual([]);
  });

  const contextFor = (method: string, path: string) =>
    ({ switchToHttp: () => ({ getRequest: () => ({ method, path }) }) }) as any;

  it('emits catalog.changed only after a successful write', async () => {
    const service = new EventsService();
    const spy = jest.spyOn(service, 'catalogChanged');
    const interceptor = new CatalogEventsInterceptor(service);

    await firstValueFrom(interceptor.intercept(contextFor('GET', '/drinks'), { handle: () => of(1) }));
    expect(spy).not.toHaveBeenCalled();

    await firstValueFrom(interceptor.intercept(contextFor('PUT', '/drinks/1'), { handle: () => of(1) }));
    expect(spy).toHaveBeenCalledWith('drinks');
  });
});

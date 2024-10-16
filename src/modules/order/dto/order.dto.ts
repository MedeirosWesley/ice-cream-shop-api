import { ProductOrderDto } from "./product-order.dto";

export class OrderDto {
  id: string;
  clientId: string;
  paymentMethod: string;
  motorcycleCourierId: string;
  products: ProductOrderDto[];
  motorcycleCourier: any;
  client: any;

  constructor(order: any) {
    this.id = order.id;
    this.clientId = order.clientId;
    this.paymentMethod = order.paymentMethod;
    this.motorcycleCourierId = order.motorcycleCourierId;
    this.motorcycleCourier = order.motorcycleCourier;
    this.client = order.client;

    this.products = order.products.map((product: any) => new ProductOrderDto(product));
  }
}

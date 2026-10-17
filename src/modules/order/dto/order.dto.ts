import { Order } from "../entities/order.entity";
import { ProductOrderDto } from "./product-order.dto";

export class OrderDto {


  id: string;
  clientId: string;
  productId: number;
  cashChange: number;
  toTake: boolean;
  isInStorePickup: boolean;
  paymentMethod: string;
  motorcycleCourierId: string;
  products: ProductOrderDto[];
  motorcycleCourier: any;
  client: any;
  clientName: string;
  status: string;
  type: string;
  amountPaid: number;
  total: number;
  deliveryFee: number;
  date: string;


  constructor(order: Order) {
    this.id = order.id;
    this.clientId = order.clientId;
    this.paymentMethod = order.paymentMethod;
    this.motorcycleCourierId = order.motorcycleCourierId;
    this.motorcycleCourier = order.motorcycleCourier;
    this.client = order.client;
    this.clientName = order.clientName;
    this.status = order.status;
    this.type = order.type;
    this.amountPaid = order.amountPaid;
    // Colunas decimal voltam como string no SQLite
    this.total = Number(order.total ?? 0);
    this.deliveryFee = Number(order.deliveryFee ?? 0);
    this.date = order.date.toISOString();
    this.cashChange = order.cashChange;
    this.productId = order.productIndex;
    this.toTake = order.toTake;
    this.isInStorePickup = order.isInStorePickup;

    this.products = order.products.map((product: any) => new ProductOrderDto(product));
  }

  static fromEntity(order: Order): OrderDto {
    return new OrderDto(order);
  }
}

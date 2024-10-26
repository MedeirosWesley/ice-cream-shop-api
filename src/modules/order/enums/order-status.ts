export enum OrderStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Cancelled = 'Cancelled',
  Completed = 'Completed',

}

export function getOrderStatuseFromString(status: string): OrderStatus {
  switch (status) {
    case 'Pending':
      return OrderStatus.Pending;
    case 'Paid':
      return OrderStatus.Paid;
    case 'Cancelled':
      return OrderStatus.Cancelled;
    case 'Completed':
      return OrderStatus.Completed;
    default:
      throw new Error('Invalid order status');
  }
}
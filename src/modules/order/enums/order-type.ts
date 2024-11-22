enum OrderType {
  Delivery = 'Delivery',
  Store = 'Store',
}

export function getOrderTypeFromString(type: string): OrderType {
  switch (type) {
    case 'Delivery':
      return OrderType.Delivery;
    case 'Store':
      return OrderType.Store;
    default:
      return null;
  }
}
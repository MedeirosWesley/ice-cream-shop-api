/**
 * Relações necessárias para montar um OrderDto completo (com preços).
 * As relações de preço em si (size, additional.additional, drink.drink...)
 * são carregadas automaticamente por serem `eager` nas entidades de produto.
 */
export const ORDER_RELATIONS = [
  'products',
  'products.popsicle',
  'products.popsicle.popsicles',
  'products.popsicle.popsicles.popsicle',
  'products.acai',
  'products.acai.additionals',
  'products.milkShake',
  'products.milkShake.flavors',
  'products.milkShake.syrup',
  'products.milkShake.additionals',
  'products.drink',
  'products.iceCream',
  'products.iceCreamPot',
  'motorcycleCourier',
  'client',
  'products.onSaleAcaiOrder',
  'products.onSaleAcaiOrder.onSaleAcai',
  'products.onSaleAcaiOrder.onSaleAcai.additionals',
  'products.onSaleAcaiOrder.additionalExtra',
  'products.onSaleAcaiOrder.additionalExtra.additional',
  'products.onSaleAcaiOrder.additionalRemoved',
  'products.onSaleAcaiOrder.additionalRemoved.additional',
  'products.otherProductOrder',
  'products.otherProductOrder.otherProduct',
];

import { Injectable } from '@nestjs/common';
import * as escpos from 'escpos';
import * as escposUSB from 'escpos-usb';
import { OrderDto } from '../order/dto/order.dto';
import { ProductOrderDto } from '../order/dto/product-order.dto';
import { AcaiDto } from '../acai/dto/acai.dto';
import { MilkShakeDto } from '../milk-shake/dto/milk-shake.dto';
import { DrinkOrderDto } from '../drink-order/dto/drink-order.dto';
import { IceCreamOrderDto } from '../ice-cream-order/dto/ice-cream-order.dto';
import { OnSaleAcaiOrder } from '../on-sale-acai-order/entities/on-sale-acai-order.entity';
import { OtherProductOrder } from '../other-product-order/entities/other-product-order.entity';
import { PopsiclesOrderDto } from '../popsicle-order/dto/popsicles-order.dto';
import { IceCreamPotOrder } from '../ice-cream-pot-order/entities/ice-cream-pot-order.entity';


@Injectable()
export class PrinterService {

  async openDevice(device: any): Promise<void> {
    return new Promise((resolve, reject) => {
      device.open((error: any) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }

  async printName(name: string) {
    try {
      const device = await escposUSB.getDevice();

      if (!device) {
        console.log('Nenhuma impressora conectada');
        return;
      }

      const options = { encoding: "CP860" }
      var printer = new escpos.Printer(device, options);

      device.open((error: any) => {
        if (error) {
          console.log('Erro ao abrir a impressora:', error);
          return;
        }
        printer.flush();
        printer.text(name.replaceAll('-', ' '));
        printer.cut();
        return printer.close();
      });
    } catch (error) {
      console.log('Erro ao imprimir:', error);
    }
  }



  async printOrder(orderDetails: OrderDto) {

    if (orderDetails.type === 'Store' && (orderDetails.products.filter(item => item.status).length === 0)) {
      return;
    }

    function formatItems(items: ProductOrderDto[], type: string) {
      let itemsToPrint: ProductOrderDto[];
      if (type === 'Delivery') {
        itemsToPrint = items;
      }
      else {
        itemsToPrint = items.filter(item => item.status);
      }
      const print = itemsToPrint.map(item => {
        switch (item.productType) {
          case 'acai':

            const acai = item.product as AcaiDto;

            let acaiprintItem = '';

            const name = `${item.quantity} x ${acai.isJuice ? 'Suco de ' : ''}Açaí ${acai.size.size.toFixed(0)} ml ${acai.inCup ? ' - (COPO)' : ''}`;
            const price = `R$${(item.quantity * acai.size.price).toFixed(2)}`;
            acaiprintItem += `${name} ${'.'.repeat(45 - name.length - price.length)} ${price}`;

            if (acai.additionals) {
              acai.additionals.forEach(additional => {
                const name = `${additional.quantity} x ${additional.additional.name}${additional.isSeparated ? ' (SEPARADO)' : ''}`;
                const price = `${(additional.quantity * additional.additional.price) < 10 ? `R$ ` : `R$`}${(additional.quantity * additional.additional.price).toFixed(2)}`;

                const dots = '.'.repeat(43 - name.length - price.length);
                acaiprintItem += `\n  ${name} ${dots} ${price}`;
              });
            }


            if (item.observation) acaiprintItem += `\nObservação: ${item.observation}`;
            let subtotal = ((acai.size.price + acai.additionals.reduce((acc, additional) => acc + additional.additional.price, 0)) * item.quantity);
            acaiprintItem += `\n\n${' '.repeat(34 - subtotal.toFixed(2).length)}SubTotal: ${subtotal < 10 ? 'R$ ' : 'R$'}${subtotal.toFixed(2)}`;
            return acaiprintItem;
          case 'milk_shake':
            const milkShake = item.product as MilkShakeDto;
            let milkShakePrintItem = '';
            let milkShakename = `${item.quantity}x Milk Shake ${milkShake.size.size.toFixed(0)} ml`;
            let milkShakePrice = `${(item.quantity * milkShake.size.price) < 10 ? `R$ ` : `R$`}${(item.quantity * milkShake.size.price).toFixed(2)}`;
            const milkDots = '.'.repeat(44 - milkShakename.length - milkShakePrice.length);


            milkShakePrintItem += `${milkShakename} ${milkDots} ${milkShakePrice}`;

            milkShakePrintItem += `\n  Sabor:`;


            milkShake.flavors.forEach(flavor => {
              milkShakePrintItem += `\n    ${flavor.iceCreamFlavor.name}`;
            });

            if (milkShake.syrup) {
              milkShakePrintItem += `\n  Calda: ${milkShake.syrup.name}`;
            }

            if (milkShake.additionals.length !== 0) milkShakePrintItem += `\n  Adicionais:`;

            milkShake.additionals.forEach(additional => {
              const name = `${additional.quantity}x ${additional.additional.name}`;
              const price = `${(additional.quantity * additional.additional.price) < 10 ? `R$ ` : `R$`}  ${(additional.quantity * additional.additional.price).toFixed(2)}`;
              const dots = '.'.repeat(37 - name.length - price.length);
              milkShakePrintItem += `\n    ${name} ${dots} ${price}`;
            });
            if (item.observation) milkShakePrintItem += `\nObservação: ${item.observation}`;
            let milkSubtotal = ((milkShake.size.price + milkShake.additionals.reduce((acc, additional) => acc + additional.additional.price, 0)) * item.quantity);
            milkShakePrintItem += `\n\n${' '.repeat(34 - milkSubtotal.toFixed(2).length)}Subtotal: ${milkSubtotal < 10 ? 'R$ ' : 'R$'}${milkSubtotal.toFixed(2)}`;

            return milkShakePrintItem;
          case 'popsicle':
            const popsicles = (item.product as PopsiclesOrderDto).popsicles;
            let popsiclePrintItem = `Picolé`
            popsicles.forEach(popsicle => {
              const name = `${popsicle.popsicleQuantity}x ${popsicle.popsicle.name}`;
              const price = `${(popsicle.popsicleQuantity * popsicle.popsicle.price).toFixed(2)}`;
              popsiclePrintItem += `\n${name} ${'.'.repeat(45 - name.length - price.length)} ${price}`;
            });
            return popsiclePrintItem;
          case 'drink':
            const drink = item.product as DrinkOrderDto;
            return `${item.quantity}x ${drink.drink.name} .......... R$${(item.quantity * drink.drink.price).toFixed(2)}`;
          case 'ice_cream':
            const iceCream = item.product as IceCreamOrderDto;
            let iceCreamPrintItem = `${item.quantity}x Sorvete ${iceCream.price.toFixed(2)}`;
            if (iceCream.flavors) {
              iceCream.flavors.forEach(flavor => {
                iceCreamPrintItem += `\n\t${flavor.iceCreamFlavor.name}`;
              });
            }
            return iceCreamPrintItem;
          case 'ice_cream_pot':
            const iceCreamPot = item.product as IceCreamPotOrder;
            let iceCreamPotPrintItem = '';
            const iceCreamPotName = `${item.quantity}x Pote de Sorvete ${iceCreamPot.size.size} ml`;
            const iceCreamPotPrice = `R$${(item.quantity * iceCreamPot.size.price).toFixed(2)}`;
            iceCreamPotPrintItem += `${iceCreamPotName} ${'.'.repeat(45 - iceCreamPotName.length - iceCreamPotPrice.length)} ${iceCreamPotPrice}`;
            iceCreamPotPrintItem += `\n  Sabor: ${iceCreamPot.flavor.name}`;
            iceCreamPotPrintItem += `\n\n${' '.repeat(37 - iceCreamPotPrice.length)}Subtotal: ${iceCreamPotPrice}`
            return iceCreamPotPrintItem;
          case 'on_sale_acai':
            const onSaleAcai = item.product as OnSaleAcaiOrder;

            let onSaleAcaiPrintItem = '';

            const onSaleAcaiName = `${item.quantity * onSaleAcai.onSaleAcai.quantity}x Açaí PROMOÇÃO ${onSaleAcai.onSaleAcai.size.size.toFixed(0)} ml`;
            const onSaleAcaiPrice = `R$${(item.quantity * onSaleAcai.onSaleAcai.price).toFixed(2)}`;
            onSaleAcaiPrintItem += `${onSaleAcaiName} ${'.'.repeat(45 - onSaleAcaiName.length - onSaleAcaiPrice.length)} ${onSaleAcaiPrice}`;
            const additionalRemoved = new Set(onSaleAcai.additionalRemoved.map(item => item.additional.id));
            const additionals = onSaleAcai.onSaleAcai.additionals.filter(additional => additionalRemoved.has(additional.additional.id));
            const additionalsNotRemoved = onSaleAcai.onSaleAcai.additionals.filter(additional => !additionalRemoved.has(additional.additional.id));

            additionalsNotRemoved.forEach(additional => {
              const name = `1 x ${additional.additional.name}`;
              const price = `-`;

              const dots = '.'.repeat(37 - name.length - price.length);
              onSaleAcaiPrintItem += `\n\t${name} ${dots} ${price}`;

            });

            if (onSaleAcai.additionalExtra.length !== 0) {
              onSaleAcaiPrintItem += '\n';
              onSaleAcaiPrintItem += '\n\t--------- Adicionais Extras ---------\n';
            }



            onSaleAcai.additionalExtra.forEach(additional => {
              const onSaleAcaiName = `${additional.quantity} x ${additional.additional.name}${additional.isSeparated ? ' (SEPARADO)' : ''}`;
              const onSaleAcaiPrice = `${(additional.quantity * additional.additional.price) < 10 ? `R$ ` : `R$`}${(additional.quantity * additional.additional.price).toFixed(2)}`;

              const dots = '.'.repeat(37 - onSaleAcaiName.length - onSaleAcaiPrice.length);
              onSaleAcaiPrintItem += `\t${onSaleAcaiName} ${dots} ${onSaleAcaiPrice}\n`;
            });
            if (item.observation) onSaleAcaiPrintItem += `\nObservação: ${item.observation}`;
            return onSaleAcaiPrintItem;

          case 'other_product':
            const otherProduct = item.product as OtherProductOrder;
            let otherProductPrintItem = '';
            const otherProductName = `${item.quantity}x ${otherProduct.otherProduct.name}`;
            const otherProductPrice = `R$${(item.quantity * otherProduct.otherProduct.price).toFixed(2)}`;
            otherProductPrintItem += `${otherProductName} ${'.'.repeat(45 - otherProductName.length - otherProductPrice.length)} ${otherProductPrice}`;
            return otherProductPrintItem;
          default:
            return '';
        }
      }).join(`\n===============================================\n\n`);

      return print;
    }

    function formatDateTime(date: string) {
      const dateObj = new Date(date);
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear().toString();
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    function formatPaymentMethod(paymentMethod: string) {
      let printPaymentMethod = '';
      switch (paymentMethod) {
        case 'money':
          printPaymentMethod = 'Dinheiro';
          break;
        case 'credit_card':
          printPaymentMethod = 'Cartão';
          break;
        case 'pix':
          printPaymentMethod = 'PIX';
          break;
        default:
          return '';
      }
      if (printPaymentMethod) {
        printPaymentMethod = `Forma de Pagamento: ${printPaymentMethod}`;
      }
      return printPaymentMethod;
    }

    function getChange(order: OrderDto) {
      if (order.cashChange) {
        return `Troco para: R$${order.cashChange.toFixed(2)}\nValor do troco: R$${(order.cashChange - getTotal(order.products, order.type)).toFixed(2)}`;
      }
      return '';
    }

    function formatClient(clientName: string, client: any) {
      let printClient = '';
      if (clientName) {
        printClient += `Cliente: ${clientName.charAt(0).toUpperCase() + clientName.slice(1)}`;
      }
      if (client) {
        const formatClientName = client.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const formatClientStreet = client.street.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const formatClientNeighborhood = client.neighborhood.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const formatClientReference = client.reference.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        printClient += `Cliente: ${formatClientName}\n`;
        printClient += `Telefone: ${client.phone}\n`;
        printClient += `Endereço: ${formatClientStreet}, ${client.houseNumber} - ${formatClientNeighborhood}\n`;
        if (client.reference) {
          printClient += `Referência: ${formatClientReference}\n`;
        }
      }
      return printClient;
    }

    function getToTake(order: OrderDto) {
      if (order.toTake) {
        return 'LEVAR';
      }
      return ''
    }


    function getTotal(items: ProductOrderDto[], type: string): number {
      let total = 0;
      items.forEach(item => {
        switch (item.productType) {
          case 'acai':
            const acai = item.product as AcaiDto;
            total += item.quantity * acai.size.price;
            acai.additionals.forEach(additional => {
              total += item.quantity * (additional.additional.price * additional.quantity);
            });
            break;
          case 'milk_shake':
            const milkShake = item.product as MilkShakeDto;
            total += item.quantity * milkShake.size.price;
            milkShake.additionals.forEach(additional => {
              total += item.quantity * (additional.additional.price * additional.quantity);
            });
            break;
          case 'popsicle':
            const popsicle = item.product as PopsiclesOrderDto;
            total += item.quantity * (popsicle.popsicles.reduce((acc, popsicle) => acc + (popsicle.popsicleQuantity * popsicle.popsicle.price), 0));
            break;
          case 'drink':
            const drink = item.product as DrinkOrderDto;
            total += item.quantity * drink.drink.price;
            break;
          case 'ice_cream':
            const iceCream = item.product as IceCreamOrderDto;
            total += item.quantity * iceCream.price;
            break;
          case 'ice_cream_pot':
            const iceCreamPot = item.product as IceCreamPotOrder;
            total += item.quantity * iceCreamPot.size.price;
            break;
          case 'on_sale_acai':
            const onSaleAcai = item.product as OnSaleAcaiOrder;
            total += item.quantity * (onSaleAcai.onSaleAcai.price + onSaleAcai.additionalExtra.reduce((acc, additional) => acc + (additional.quantity * additional.additional.price), 0));
            break;
          case 'other_product':
            const otherProduct = item.product as OtherProductOrder;
            total += item.quantity * otherProduct.otherProduct.price;
          default:
            break;
        }
      });
      if (type === 'Delivery') {
        total += 1.5;
      }
      return total
    }


    // console.log(`Número do Pedido: ${orderDetails.productId}\n
    //   Data: ${formatDateTime(orderDetails.date.toString())}\n
    //   ${formatClient(orderDetails.clientName, orderDetails.client)}\n
    //   ${getToTake(orderDetails)}\n${formatItems(orderDetails.products, orderDetails.type)}\n
    //   ${formatPaymentMethod(orderDetails.paymentMethod)}\n
    //   Total: R$${getTotal(orderDetails.products, orderDetails.type).toFixed(2)}\n${getChange(orderDetails)}
    //   `);


    try {
      const device = await escposUSB.getDevice();

      if (!device) {
        console.error('Nenhuma impressora conectada');
        return;
      }

      const options = { encoding: "CP860" }
      await this.openDevice(device);


      const printer = new escpos.Printer(device, options);




      if (orderDetails.type != 'Delivery') {
        printer
          .align('CT')
          .text('Kimolek')
          .feed(1)
          .text('---------- Ordem de Pedido ---------')
          .feed(1)
          .align('LT')
          .text(`Número do Pedido: ${orderDetails.productId % 100}`)
          .text(`Data: ${formatDateTime(orderDetails.date.toString())}`)
          .text(formatClient(orderDetails.clientName, orderDetails.client))
          .drawLine()
          .text(getToTake(orderDetails))
          .text(formatItems(orderDetails.products, orderDetails.type))
          .drawLine()
          .feed(1)
          .text(`Total: R$${getTotal(orderDetails.products, orderDetails.type).toFixed(2)}`)
          .drawLine()
          .feed(1)
          .cut()
      }

      printer
        .align('CT')
        .text('Kimolek')
        .feed(1)
        .text('---------- Ordem de Pedido ---------')
        .feed(1)
        .align('LT')
        .text(`Número do Pedido: ${orderDetails.productId % 100}`)
        .text(`Data: ${formatDateTime(orderDetails.date.toString())}`)
        .text(formatClient(orderDetails.clientName, orderDetails.client))
        .drawLine()
        .text(getToTake(orderDetails))
        .text(formatItems(orderDetails.products, orderDetails.type))  // Lista os itens
        .drawLine()
        .feed(1)
        .text(`${formatPaymentMethod(orderDetails.paymentMethod)}`)
        .text(`Total: R$${getTotal(orderDetails.products, orderDetails.type).toFixed(2)}`)
        .text(getChange(orderDetails))
        .drawLine()
        .feed(1)
        .cut()
        .close();


    } catch (error) {
      console.error('Erro ao imprimir:', error);
    }
  }
}

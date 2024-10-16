import { Injectable } from '@nestjs/common';
import * as escpos from 'escpos';
import * as escposUSB from 'escpos-usb';
import { OrderDto } from '../order/dto/order.dto';
import { ProductOrderDto } from '../order/dto/product-order.dto';
import { AcaiDto } from '../acai/dto/acai.dto';
import { MilkShakeDto } from '../milk-shake/dto/milk-shake.dto';
import { PopsicleDto } from '../popsicle/dto/popsicle.dto';
import { PopsicleOrderDto } from '../popsicle-order/dto/popsicle-order.dto';
import { DrinkOrderDto } from '../drink-order/dto/drink-order.dto';
import { IceCreamOrderDto } from '../ice-cream-order/dto/ice-cream-order.dto';


@Injectable()
export class PrinterService {
  async printOrder(orderDetails: OrderDto) {

    function formatItems(items: ProductOrderDto[]) {
      return items.map(item => {
        switch (item.productType) {
          case 'acai':

            const acai = item.product as AcaiDto;
            let acaiprintItem = `${item.quantity}x Açaí ${acai.size.size.toFixed(0)} .......... R$${acai.size.price.toFixed(2)}`;

            acai.additionals.forEach(additional => {
              const name = `${additional.quantity}x ${additional.additional.name}${additional.isSeparated ? ' (SEPARADO)' : ''}`;
              const price = `R$${(item.quantity * additional.additional.price).toFixed(2)}`;

              const dots = '.'.repeat(35 - name.length - price.length);  // Ajuste o número 30 conforme necessário
              acaiprintItem += `\n\t${name} ${dots} ${price}`;
            });
            return acaiprintItem;
          case 'milk_shake':
            const milkShake = item.product as MilkShakeDto;
            let milkShakePrintItem = `${item.quantity}x Milk Shake ${milkShake.size.size.toFixed(0)} .......... R$${(item.quantity * milkShake.size.price).toFixed(2)}`;
            milkShake.additionals.forEach(additional => {
              const name = `${additional.quantity}x ${additional.additional.name}`;
              const price = `R$${additional.additional.price.toFixed(2)}`;

              const dots = '.'.repeat(30 - name.length - price.length);  // Ajuste o número 30 conforme necessário
              milkShakePrintItem += `\n\t${name} ${dots} ${price}`;
            });
            return milkShakePrintItem;
          case 'popsicle':
            const popsicle = item.product as PopsicleOrderDto;
            let popsiclePrintItem = `${item.quantity}x Picolé`
            popsiclePrintItem += `\n\t${popsicle.popsicle.name} .......... R$${(item.quantity * popsicle.popsicle.price).toFixed(2)}`;
          case 'drink':
            const drink = item.product as DrinkOrderDto;
            return `${item.quantity}x ${drink.drink.name} .......... R$${(item.quantity * drink.drink.price).toFixed(2)}`;
          case 'ice_cream':
            const iceCream = item.product as IceCreamOrderDto;
            let iceCreamPrintItem = `${item.quantity}x Sorvete ${iceCream.price.toFixed(2)}`;
            if (iceCream.flavors.length !== 0) {
              iceCream.flavors.forEach(flavor => {
                iceCreamPrintItem += `\n\t${flavor.iceCreamFlavor.name}`;
              });
            }
            return iceCreamPrintItem;
          case 'ice_cream_pot':
            const iceCreamPot = item.product as IceCreamOrderDto;
            let iceCreamPotPrintItem = `${item.quantity}x Pote de Sorvete ${iceCreamPot.price.toFixed(2)}`;
            if (iceCreamPot.flavors.length !== 0) {
              iceCreamPot.flavors.forEach(flavor => {
                iceCreamPotPrintItem += `\n\t${flavor.iceCreamFlavor.name}`;
              });
            }
            return iceCreamPotPrintItem;
          default:
            return '';
        }
      }).join('\n');
    }
    try {
      const device = await escposUSB.getDevice();

      if (!device) {
        console.error('Nenhuma impressora conectada');
        return;
      }
      device.open((error) => {
        if (error) {
          console.error('Erro ao abrir a conexão com a impressora:', error);
          return;
        }
      });
      const printer = new escpos.Printer(device);

      printer.encode('CP860');



      await printer
        .align('CT')
        .text('Kimolek')
        .align('LT')
        .text('---- Ordem de Pedido ----')
        .text(`Número do Pedido: ${orderDetails.id}`)
        .text(`Cliente: ${orderDetails.client.name}`)
        .text('----------------------------')
        .text(formatItems(orderDetails.products))  // Lista os itens
        .text('----------------------------')
        .text(`Total: R$${orderDetails}`)
        .text(`Data: ${orderDetails}`)
        .text('----------------------------')
        .cut()  // Cortar o papel
        .close();

      console.log('Impressão concluída com sucesso');
    } catch (error) {
      console.error('Erro ao imprimir:', error);
    }
  }
}

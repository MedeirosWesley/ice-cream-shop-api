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
import { Client } from '../client/entities/client.entity';


@Injectable()
export class PrinterService {
  async printOrder(orderDetails: OrderDto) {

    function formatItems(items: ProductOrderDto[]) {
      return items.map(item => {
        switch (item.productType) {
          case 'acai':

            const acai = item.product as AcaiDto;

            let acaiprintItem = '';

            const name = `${item.quantity} x Açaí ${acai.size.size.toFixed(0)}`
            const price = `R$${(item.quantity * acai.size.price).toFixed(2)}`;
            acaiprintItem += `${name} ${'.'.repeat(45 - name.length - price.length)} ${price}`;

            acai.additionals.forEach(additional => {
              const name = `${additional.quantity} x ${additional.additional.name}${additional.isSeparated ? ' (SEPARADO)' : ''}`;
              const price = `${(additional.quantity * additional.additional.price) < 10 ? `R$ ` : `R$`}${(additional.quantity * additional.additional.price).toFixed(2)}`;

              const dots = '.'.repeat(37 - name.length - price.length);  // Ajuste o número 30 conforme necessário
              acaiprintItem += `\n\t${name} ${dots} ${price}`;
            });
            if (item.observation) acaiprintItem += `\nObservação: ${item.observation}`;
            return acaiprintItem;
          case 'milk_shake':
            const milkShake = item.product as MilkShakeDto;
            let milkShakePrintItem = `${item.quantity}x Milk Shake ${milkShake.size.size.toFixed(0)} .......... R$${(item.quantity * milkShake.size.price).toFixed(2)}`;
            milkShake.additionals.forEach(additional => {
              const name = `${additional.quantity}x ${additional.additional.name}`;
              const price = `${(additional.quantity * additional.additional.price) < 10 ? `R$ ` : `R$`}  ${(additional.quantity * additional.additional.price).toFixed(2)}`;

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
      }).join(`\n\n/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\n\n`);
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
      switch (paymentMethod) {
        case 'money':
          return 'Dinheiro';
        case 'credit_card':
          return 'Cartão';
        case 'pix':
          return 'PIX';
        default:
          return '';
      }
    }

    function formatClient(clientName: string, client: any) {
      let printClient = '';
      if (clientName) {
        printClient += `Cliente: ${clientName}`;
      }
      if (client) {
        printClient += `Cliente: ${client.name}\n`;
        printClient += `Telefone: ${client.phone}\n`;
        printClient += `Endereço: ${client.street}, ${client.houseNumber} - ${client.neighborhood}\n`;
        if (client.reference) {
          printClient += `Referência: ${client.reference}\n`;
        }
      }
      return printClient;
    }


    function getTotal(items: ProductOrderDto[]): number {
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
            const popsicle = item.product as PopsicleOrderDto;
            total += item.quantity * popsicle.popsicle.price;
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
            const iceCreamPot = item.product as IceCreamOrderDto;
            total += item.quantity * iceCreamPot.price;
            break;
          default:
            break;
        }
      });
      return total
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
        .drawLine()
        .align('CT')
        .style('B')
        .text('Kimolek')
        .style('NORMAL')
        .feed(1)
        .text('---------- Ordem de Pedido ---------')
        .feed(1)
        .align('LT')
        .font('A')
        .text(`Número do Pedido: ${orderDetails.productId}`)
        .text(`Data: ${formatDateTime(orderDetails.date.toString())}`)
        .text(formatClient(orderDetails.clientName, orderDetails.client))
        .drawLine()
        .feed(1)
        .text(formatItems(orderDetails.products))  // Lista os itens
        .feed(1)
        .drawLine()
        .align('RT')
        .feed(1)
        .text(`Total: R$${getTotal(orderDetails.products).toFixed(2)}`)
        .drawLine()
        .feed(1)
        .cut()
        .close();

      console.log('Impressão concluída com sucesso');
    } catch (error) {
      console.error('Erro ao imprimir:', error);
    }
  }
}

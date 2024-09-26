import { Injectable } from '@nestjs/common';
import * as escpos from 'escpos';
import * as escposUSB from 'escpos-usb';


@Injectable()
export class PrinterService {
  async printOrder(orderDetails) {
    // const orderDetails = {
    //   orderNumber: '12345',
    //   customerName: 'teste do João Silva',
    //   items: [
    //     { name: 'Açaí 500ml', quantity: 1, price: 12.00 },
    //     { name: 'Granola', quantity: 1, price: 2.50 },
    //     { name: 'Banana', quantity: 1, price: 1.50 }
    //   ],
    //   total: 16.00,
    //   date: new Date().toLocaleString()
    // };

    // Função para formatar os itens do pedido

    function formatItems(items) {
      return items.map(item => {
        return `${item.quantity}x ${item.name} ....... R$${item.price.toFixed(2)}`;
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
        .align('CT')  // Centralizar
        .text('---- Ordem de Pedido ----')
        .text(`Número do Pedido: ${orderDetails.orderNumber}`)
        .text(`Cliente: ${orderDetails.customerName}`)
        .text('----------------------------')
        .text(formatItems(orderDetails.items))  // Lista os itens
        .text('----------------------------')
        .text(`Total: R$${orderDetails.total.toFixed(2)}`)
        .text(`Data: ${orderDetails.date}`)
        .text('----------------------------')
        .text('Obrigado pela preferência!')
        .cut()  // Cortar o papel
        .close();

      console.log('Impressão concluída com sucesso');
    } catch (error) {
      console.error('Erro ao imprimir:', error);
    }
  }
}

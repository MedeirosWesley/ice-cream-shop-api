import { Injectable } from '@nestjs/common';


@Injectable()
export class PrinterService {
  printOrder(orderDetails: string) {
    const escpos = require('escpos-usb');

    const device = escpos.getDevice()
    const printer = new escpos.findPrinter();

    console.log(device);

    device.open((error) => {
      if (error) {
        console.error('Erro ao abrir a conexão com a impressora:', error);
        return;
      }

      printer
        .align('CT')
        .text('---- Ordem de Pedido ----')
        .text(orderDetails)
        .cut()
        .close();
    });
  }
}

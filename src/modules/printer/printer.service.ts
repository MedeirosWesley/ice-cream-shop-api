import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
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
import * as jimp from 'jimp';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { printer as pt, types as PrinterTypes, CharacterSet } from 'node-thermal-printer';
import { SerialPort } from 'serialport';
import { calculateOrderTotal } from '../order/utils/order-total';



@Injectable()
export class PrinterService {
  private readonly useUSB = true;

  // Fila de impressão: só um job por vez na impressora. O `usb` reaproveita o mesmo
  // handle nativo para o mesmo aparelho, então dois pedidos simultâneos faziam um
  // fechar o handle enquanto o outro ainda transferia — crash nativo que derrubava
  // o processo depois de imprimir.
  private queue: Promise<unknown> = Promise.resolve();

  private enqueue<T>(job: () => Promise<T>): Promise<T> {
    const run = this.queue.then(job, job);
    this.queue = run.catch(() => undefined); // uma falha não trava a fila
    return run;
  }

  // Dá tempo do libusb/WinUSB soltar o handle antes do próximo getDevice().
  private releaseDelay() {
    return new Promise((resolve) => setTimeout(resolve, 300));
  }

  printImage(imageUrl: any) {
    return this.enqueue(() => this.doPrintImage(imageUrl));
  }

  printName(name: string) {
    return this.enqueue(() => this.doPrintName(name));
  }

  printViaComPort() {
    return this.enqueue(() => this.doPrintViaComPort());
  }

  printOrder(orderDetails: OrderDto, printAll: boolean) {
    return this.enqueue(() => this.doPrintOrder(orderDetails, printAll));
  }

  private async doPrintImage(imageUrl: any) {
    const escposImage = await new Promise<escpos.Image>((resolve, reject) => {
      escpos.Image.load(imageUrl.imageUrl, (loadedImage) => {
        if (loadedImage instanceof Error) {
          console.log('Erro ao carregar a imagem para escpos:');
          reject(new Error("Erro ao carregar a imagem para escpos"));
          return;
        }
        resolve(loadedImage as escpos.Image);
      });
    });
    const device = await escposUSB.getDevice();

    if (!device) {
      this.logger.warn('Nenhuma impressora USB encontrada.');
      return false;
    }

    const options = { encoding: "CP860" };
    // getDevice() já devolve o adaptador aberto.
    const printer = new escpos.Printer(device, options);

    printer
      .image(escposImage, 'D24');
    printer
      .cut();


    await new Promise((resolve, reject) => {
      printer.close((err) => {
        if (err) {
          this.logger.error('Erro ao dar close na impressora:', err);
          reject(err);
        } else {
          resolve(null);
        }
      });
    });
    await this.releaseDelay();
  }
  private readonly logger = new Logger(PrinterService.name);

  async createImageForPrinter(texto): Promise<escpos.Image | null> {
    try {

      const width = 576;
      const height = 100;


      const image = await new jimp.Jimp({ width: width, height: height, color: '#FFFFFF' });
      const filePath = path.resolve(__dirname, '../../../assets/roboto.fnt');
      const font = await jimp.loadFont(filePath);


      image.print({
        font: font,
        x: 0,
        y: 0,
        text: {
          text: texto,
          alignmentX: jimp.HorizontalAlign.CENTER,
          alignmentY: jimp.VerticalAlign.MIDDLE,
        },
        maxWidth: width,
        maxHeight: height
      });

      image.greyscale().contrast(1).dither().posterize(2);

      // 1. Gerar caminho temporário
      const tempDir = os.tmpdir();
      const tempPath = path.join(tempDir, `print-image-${Date.now()}.png`);

      // 2. Salvar a imagem no disco
      await image.write(`${tempPath}.png`);

      await new Promise(resolve => setTimeout(resolve, 1000));


      const escposImage = await new Promise<escpos.Image>((resolve, reject) => {
        escpos.Image.load(`${tempPath}.png`, (loadedImage) => {
          if (loadedImage instanceof Error) {
            console.log('Erro ao carregar a imagem para escpos:');
            reject(new Error("Erro ao carregar a imagem para escpos"));
            return;
          }
          resolve(loadedImage as escpos.Image);
        });
      });

      fs.unlink(tempPath, () => { });

      return escposImage;


    } catch (error) {
      console.error("Erro ao criar a imagem:", error);
      return null;
    }
  }



  private async doPrintName(name: string) {
    try {
      const device = await escposUSB.getDevice();

      if (!device) {
        this.logger.warn('Nenhuma impressora USB encontrada.');
        return false;
      }

      const options = { encoding: "CP860" };
      // getDevice() já devolve o adaptador aberto.
      const printer = new escpos.Printer(device, options);

      const image = await new Promise<escpos.Image>((resolve) => this.createImageForPrinter(name.replaceAll('-', ' ')).then(resolve));
      if (!image) {
        this.logger.error('Erro ao criar a imagem para impressão.');
        return;
      }

      printer
        .image(image, 'D24');
      printer
        .cut();

      await new Promise((resolve, reject) => {
        printer.close((err) => {
          if (err) {
            this.logger.error('Erro ao dar close na impressora:', err);
            reject(err);
          } else {
            resolve(null);
          }
        });
      });
      await this.releaseDelay();
    } catch (error) {
      this.logger.error('Erro ao imprimir nome:', error);
    }
  }

  private async doPrintViaComPort() {
    // 1. Configurar o gerador de buffer
    let printer = new pt({
      type: PrinterTypes.CUSTOM,
      interface: 'serial',
      removeSpecialCharacters: false,
    });


    printer.alignCenter();
    printer.println("Kimolek");
    printer.println('teste');
    printer.cut();

    const buffer = printer.getBuffer();

    const port = new SerialPort({
      path: 'COM4',
      baudRate: 9600,
    });

    return new Promise((resolve, reject) => {
      port.on('open', () => {
        port.write(buffer, (err) => {
          if (err) {
            reject(err);
          } else {
            // Importante: esperar o dreno do buffer antes de fechar
            port.drain(() => {
              setTimeout(() => {
                port.close();
                resolve(true);
              }, 500);
            });
          }
        });
      });

      port.on('error', (err) => {
        reject(err);
      });
    });
  }



  private async doPrintOrder(orderDetails: OrderDto, printAll: boolean) {

    if (orderDetails.type === 'Store' && (orderDetails.products.filter(item => item.status).length === 0) && !printAll) {
      return;
    }

    function formatItems(items: ProductOrderDto[], type: string, clientPrint: boolean = false) {
      let itemsToPrint: ProductOrderDto[];
      if (type === 'Delivery' || printAll || orderDetails.isInStorePickup || clientPrint) {
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

            const name = `${item.quantity} x ${acai.isJuice ? 'Suco de ' : ''}Açaí ${acai.size.size.toFixed(0)} ml ${acai.inCup ? ' - (COPO)' : type === 'Delivery' || orderDetails.toTake || orderDetails.isInStorePickup || printAll || clientPrint || acai.isJuice ? '' : '(TIGELA)'}`;
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
            const drinkName = `${item.quantity}x ${drink.drink.name}`;
            const drinkPrice = `R$${(item.quantity * drink.drink.price).toFixed(2)}`;
            return `${drinkName} ${'.'.repeat(45 - drinkName.length - drinkPrice.length)} ${drinkPrice}`;
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
            if (item.observation) otherProductPrintItem += `\nObservação: ${item.observation}`;
            return otherProductPrintItem;
          default:
            return '';
        }
      }).join(`\n-----------------------------------------------\n\n`);

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
      if (order.cashChange == 0) {
        return '';
      }
      if (order.cashChange) {
        return `Troco para: R$${order.cashChange.toFixed(2)}\nValor do troco: R$${(order.cashChange - calculateOrderTotal(order.products, order.type, order.isInStorePickup)).toFixed(2)}`;
      }
      return '';
    }

    function formatClient(clientName: string, client: any) {
      let printClient = '';
      // `clientName` é o nome do próprio pedido e vence o do cadastro: é ele que
      // o caixa corrige na tela de pedidos. Sem isso, um pedido que tem os dois
      // (entrega com retirada no balcão) sairia com duas linhas "Cliente:".
      if (clientName) {
        printClient += `Cliente: ${clientName.charAt(0).toUpperCase() + clientName.slice(1)}\n`;
      }
      if (client) {
        const formatClientName = client.name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const formatClientStreet = client.street.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const formatClientNeighborhood = client.neighborhood.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const formatClientReference = client.reference.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        if (!clientName) {
          printClient += `Cliente: ${formatClientName}\n`;
        }
        printClient += `Telefone: ${client.phone}\n`;
        if (!client.neighborhood && !client.street) {
          printClient += `Endereço: ${formatClientReference}\n`;
        } else {
          printClient += `Endereço: ${formatClientStreet}, ${client.houseNumber} - ${formatClientNeighborhood}\n`;
          if (client.reference) {
            printClient += `Referência: ${formatClientReference}\n`;
          }
        }
      }
      return printClient;
    }

    function getToTake(order: OrderDto) {
      if (order.toTake) {
        return 'LEVAR';
      }
      if (order.isInStorePickup) {
        return 'RETIRADA NO BALCÃO';
      }
      return ''
    }


    // console.log(`Número do Pedido: ${orderDetails.productId}\n
    //   Data: ${formatDateTime(orderDetails.date.toString())}\n
    //   ${formatClient(orderDetails.clientName, orderDetails.client)}\n
    //   ${getToTake(orderDetails)}\n${formatItems(orderDetails.products, orderDetails.type)}\n
    //   ${formatPaymentMethod(orderDetails.paymentMethod)}\n
    //   Total: R$${getTotal(orderDetails.products, orderDetails.type).toFixed(2)}\n${getChange(orderDetails)}
    //   `);


    try {
      if (this.useUSB) {
        // ----------------------------------------------------------------------------
        // IMPRESSÃO VIA USB
        // ----------------------------------------------------------------------------
        try {
          const device = await escposUSB.getDevice();
          if (!device) {
            this.logger.warn('Nenhuma impressora USB encontrada.');
            return false;
          }

          const options = { encoding: "CP860" };
          // getDevice() já devolve o adaptador aberto.
          const printer = new escpos.Printer(device, options);

          // Via do Estabelecimento
          if (!printAll) {
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
              .text(formatItems(orderDetails.products, orderDetails.type).replace(/\t/g, '    '))
              .drawLine()
              .feed(1)
              .text(`${formatPaymentMethod(orderDetails.paymentMethod)}`)
              .text(`Total: R$${calculateOrderTotal(orderDetails.products, orderDetails.type, orderDetails.isInStorePickup).toFixed(2)}`)
              .text(getChange(orderDetails))
              .drawLine()
              .feed(1)
              .cut();
          }

          // Via do Cliente
          if (orderDetails.type === 'Store' || printAll) {
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
              .text(formatItems(orderDetails.products, orderDetails.type, true))
              .drawLine()
              .feed(1)
              .text(`${formatPaymentMethod(orderDetails.paymentMethod)}`)
              .text(`Total: R$${calculateOrderTotal(orderDetails.products, orderDetails.type, orderDetails.isInStorePickup).toFixed(2)}`)
              .text(getChange(orderDetails))
              .drawLine()
              .feed(1)
              .cut();
          }

          // Força o envio de qualquer dado pendente no buffer
          await new Promise<void>((resolve) => {
            printer.flush(() => resolve());
          });

          await new Promise((resolve) => setTimeout(resolve, 1000));

          await new Promise((resolve, reject) => {
            printer.close((err) => {
              if (err) {
                this.logger.warn('Aviso ao fechar impressora (possível timeout, mas impresso):', err);
                resolve(null);
              } else {
                resolve(null);
              }
            });
          });
          await this.releaseDelay();
        } catch (usbError) {
          console.error('Erro ao imprimir via USB:', usbError);
        }
      } else {
        // ----------------------------------------------------------------------------
        // IMPRESSÃO VIA BLUETOOTH (COM4)
        // ----------------------------------------------------------------------------
        for (let attempt = 1; attempt <= 5; attempt++) {
          try {
            const ptPrinter = new pt({
              type: PrinterTypes.CUSTOM,
              interface: 'serial',
              characterSet: CharacterSet.PC860_PORTUGUESE,
              removeSpecialCharacters: false,
            });

            // Via do Estabelecimento
            if (!printAll) {
              ptPrinter.alignCenter();
              ptPrinter.println('Kimolek');
              ptPrinter.println('');
              ptPrinter.println('---------- Ordem de Pedido ---------');
              ptPrinter.println('');
              ptPrinter.alignLeft();
              ptPrinter.println(`Número do Pedido: ${orderDetails.productId % 100}`);
              ptPrinter.println(`Data: ${formatDateTime(orderDetails.date.toString())}`);
              ptPrinter.println(formatClient(orderDetails.clientName, orderDetails.client));
              ptPrinter.drawLine();
              ptPrinter.println(getToTake(orderDetails));
              ptPrinter.println(formatItems(orderDetails.products, orderDetails.type).replace(/\t/g, '    '));
              ptPrinter.drawLine();
              ptPrinter.println('');
              ptPrinter.println(`${formatPaymentMethod(orderDetails.paymentMethod)}`);
              ptPrinter.println(`Total: R$${calculateOrderTotal(orderDetails.products, orderDetails.type, orderDetails.isInStorePickup).toFixed(2)}`);
              ptPrinter.println(getChange(orderDetails));
              ptPrinter.drawLine();
              ptPrinter.println('');
              ptPrinter.cut();
            }

            // Via do Cliente
            if (orderDetails.type === 'Store' || printAll) {
              ptPrinter.alignCenter();
              ptPrinter.println('Kimolek');
              ptPrinter.println('');
              ptPrinter.println('---------- Ordem de Pedido ---------');
              ptPrinter.println('');
              ptPrinter.alignLeft();
              ptPrinter.println(`Número do Pedido: ${orderDetails.productId % 100}`);
              ptPrinter.println(`Data: ${formatDateTime(orderDetails.date.toString())}`);
              ptPrinter.println(formatClient(orderDetails.clientName, orderDetails.client));
              ptPrinter.drawLine();
              ptPrinter.println(getToTake(orderDetails));
              ptPrinter.println(formatItems(orderDetails.products, orderDetails.type, true).replace(/\t/g, '    '));
              ptPrinter.drawLine();
              ptPrinter.println('');
              ptPrinter.println(`${formatPaymentMethod(orderDetails.paymentMethod)}`);
              ptPrinter.println(`Total: R$${calculateOrderTotal(orderDetails.products, orderDetails.type, orderDetails.isInStorePickup).toFixed(2)}`);
              ptPrinter.println(getChange(orderDetails));
              ptPrinter.drawLine();
              ptPrinter.println('');
              ptPrinter.cut();
            }

            const buffer = ptPrinter.getBuffer();
            const port = new SerialPort({
              path: 'COM4',
              baudRate: 9600,
            });

            await new Promise((resolve, reject) => {
              port.on('open', () => {
                port.write(buffer, (err) => {
                  if (err) return reject(err);
                  port.drain(() => {
                    setTimeout(() => {
                      port.close();
                      resolve(true);
                    }, 500);
                  });
                });
              });
              port.on('error', (err) => reject(err));
            });
            break; // Sucesso, sai do loop
          } catch (btError) {
            console.error(`Erro ao imprimir via Bluetooth (COM4) - Tentativa ${attempt} de 5:`, btError);
            if (attempt < 5) {
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
          }
        }
      }

    } catch (error) {
      console.error('Erro geral ao imprimir:', error);
    }
  }
}

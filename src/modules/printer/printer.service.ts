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
import { calculateItemTotal, calculateOrderTotal } from '../order/utils/order-total';
import { env } from '../config/env';
import { Order } from '../order/entities/order.entity';
import { cleanDisplay, normalizeKey, toTitleCase } from '../client/utils/address-normalize';

// Pontilhado entre nome e preço. Nome comprido deixava a conta negativa e o
// repeat() lançava RangeError, derrubando o cupom inteiro.
function fillDots(count: number) {
  return '.'.repeat(Math.max(1, count));
}

/** Linha do cupom de rota: texto (centralizado ou não) ou separador. */
type RouteLine = { text?: string; center?: boolean; rule?: boolean };

function routeMoney(value: number) {
  return `R$${value.toFixed(2)}`;
}

function routeDateTime(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function routePaymentMethod(paymentMethod: string) {
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

@Injectable()
export class PrinterService {
  private readonly useUSB = env.printerUseUsb;

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

  printImage(imageUrl: string) {
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

  /** Cupom da rota de entrega: pedidos agrupados por bairro, para o entregador. */
  printDeliveryRoute(orders: Order[], courierName?: string) {
    return this.enqueue(() => this.doPrintDeliveryRoute(orders, courierName));
  }

  /** Monta as linhas do cupom de rota (independente do tipo de impressora). */
  private buildDeliveryRouteLines(orders: Order[], courierName?: string): RouteLine[] {
    const lines: RouteLine[] = [];
    const center = (text: string) => lines.push({ text, center: true });
    const left = (text: string) => lines.push({ text });
    const rule = () => lines.push({ rule: true });

    center(env.storeName);
    center('ROTA DE ENTREGA');
    if (courierName) center(`Entregador: ${toTitleCase(courierName)}`);
    center(routeDateTime(new Date()));
    rule();

    // Agrupa pela chave normalizada; o título usa a primeira grafia encontrada.
    const groups = new Map<string, { title: string; items: OrderDto[] }>();
    for (const order of orders) {
      const dto = OrderDto.fromEntity(order);
      const neighborhood = order.client?.neighborhood;
      const key = normalizeKey(neighborhood);
      if (!groups.has(key)) {
        groups.set(key, { title: cleanDisplay(neighborhood) || 'Sem bairro', items: [] });
      }
      groups.get(key).items.push(dto);
    }
    const sortedKeys = [...groups.keys()].sort((a, b) => {
      if (!a) return 1; // "Sem bairro" por último
      if (!b) return -1;
      return a.localeCompare(b, 'pt-BR');
    });

    let grandTotal = 0;
    let grandMissing = 0;
    for (const key of sortedKeys) {
      const group = groups.get(key);
      const count = group.items.length;
      left(`${group.title.toLocaleUpperCase('pt-BR')} (${count} ${count === 1 ? 'pedido' : 'pedidos'})`);
      rule();
      for (const order of group.items) {
        const client = order.client;
        const name = toTitleCase(order.clientName || client?.name || 'Cliente');
        left(`#${order.productId ?? '-'} ${name}`);
        const street = cleanDisplay(client?.street);
        if (street) {
          const number = cleanDisplay(client?.houseNumber);
          left(`  ${toTitleCase(street)}${number ? `, ${number}` : ''}`);
        }
        const reference = cleanDisplay(client?.reference);
        if (reference) left(`  Ref: ${reference}`);

        const total = calculateOrderTotal(order.products, order.deliveryFee);
        const paid = Number(order.amountPaid) || 0;
        grandTotal += total;
        left(`  Total: ${routeMoney(total)}`);
        const payment = routePaymentMethod(order.paymentMethod);
        if (payment) left(`  Pagamento: ${payment}`);
        const cashChange = Number(order.cashChange) || 0;
        if (cashChange > 0) {
          left(`  Troco para ${routeMoney(cashChange)} (troco ${routeMoney(Math.max(0, cashChange - (total - paid)))})`);
        }
        if (paid < total - 0.004) {
          grandMissing += total - paid;
          left(`  Falta ${routeMoney(total - paid)}${paid > 0 ? ` (pago ${routeMoney(paid)})` : ''}`);
        } else if (total > 0) {
          left('  PAGO');
        }
        left('');
      }
    }

    rule();
    left(`Pedidos: ${orders.length}`);
    left(`Total: ${routeMoney(grandTotal)}`);
    if (grandMissing > 0.004 && Math.abs(grandMissing - grandTotal) > 0.004) {
      left(`A receber: ${routeMoney(grandMissing)}`);
    }
    rule();
    return lines;
  }

  private async doPrintDeliveryRoute(orders: Order[], courierName?: string) {
    const lines = this.buildDeliveryRouteLines(orders, courierName);

    if (this.useUSB) {
      try {
        const device = await escposUSB.getDevice();
        if (!device) {
          this.logger.warn('Nenhuma impressora USB encontrada.');
          return false;
        }
        // getDevice() já devolve o adaptador aberto.
        const printer = new escpos.Printer(device, { encoding: 'CP860' });
        for (const line of lines) {
          if (line.rule) {
            printer.drawLine();
          } else {
            printer.align(line.center ? 'CT' : 'LT').text(line.text);
          }
        }
        printer.feed(2).cut();

        await new Promise<void>((resolve) => {
          printer.flush(() => resolve());
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await new Promise((resolve) => {
          printer.close((err) => {
            if (err) {
              this.logger.warn('Aviso ao fechar impressora (possível timeout, mas impresso):', err);
            }
            resolve(null);
          });
        });
        await this.releaseDelay();
      } catch (usbError) {
        console.error('Erro ao imprimir rota via USB:', usbError);
      }
      return;
    }

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const ptPrinter = new pt({
          type: PrinterTypes.CUSTOM,
          interface: 'serial',
          characterSet: CharacterSet.PC860_PORTUGUESE,
          removeSpecialCharacters: false,
        });
        for (const line of lines) {
          if (line.rule) {
            ptPrinter.drawLine();
          } else {
            if (line.center) ptPrinter.alignCenter();
            else ptPrinter.alignLeft();
            ptPrinter.println(line.text);
          }
        }
        ptPrinter.println('');
        ptPrinter.cut();

        const buffer = ptPrinter.getBuffer();
        const port = new SerialPort({
          path: env.printerSerialPort,
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
        console.error(`Erro ao imprimir rota via serial (${env.printerSerialPort}) - Tentativa ${attempt} de 5:`, btError);
        if (attempt < 5) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    }
  }

  private async doPrintImage(imageUrl: string) {
    const escposImage = await new Promise<escpos.Image>((resolve, reject) => {
      escpos.Image.load(imageUrl, (loadedImage) => {
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
      await image.write(tempPath as `${string}.png`);

      const escposImage = await new Promise<escpos.Image>((resolve, reject) => {
        escpos.Image.load(tempPath, (loadedImage) => {
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
    printer.println(env.storeName);
    printer.println('teste');
    printer.cut();

    const buffer = printer.getBuffer();

    const port = new SerialPort({
      path: env.printerSerialPort,
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

    // `orderDetails.toTake` também cobre os pedidos gravados antes do campo por item.
    const isItemToTake = (item: ProductOrderDto) => Boolean(orderDetails.toTake || item.toTake);
    const allToTake = orderDetails.products.length > 0 && orderDetails.products.every(isItemToTake);

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

            const name = `${item.quantity} x ${acai.isJuice ? 'Suco de ' : ''}Açaí ${acai.size.size.toFixed(0)} ml ${acai.inCup ? ' - (COPO)' : type === 'Delivery' || isItemToTake(item) || orderDetails.isInStorePickup || printAll || clientPrint || acai.isJuice ? '' : '(TIGELA)'}`;
            const price = `R$${(item.quantity * acai.size.price).toFixed(2)}`;
            acaiprintItem += `${name} ${fillDots(45 - name.length - price.length)} ${price}`;

            if (acai.additionals) {
              acai.additionals.forEach(additional => {
                const name = `${additional.quantity} x ${additional.additional.name}${additional.isSeparated ? ' (SEPARADO)' : ''}`;
                const price = `${(additional.quantity * additional.additional.price) < 10 ? `R$ ` : `R$`}${(additional.quantity * additional.additional.price).toFixed(2)}`;

                const dots = fillDots(43 - name.length - price.length);
                acaiprintItem += `\n  ${name} ${dots} ${price}`;
              });
            }


            if (item.observation) acaiprintItem += `\nObservação: ${item.observation}`;
            const subtotal = calculateItemTotal(item);
            acaiprintItem += `\n\n${' '.repeat(34 - subtotal.toFixed(2).length)}SubTotal: ${subtotal < 10 ? 'R$ ' : 'R$'}${subtotal.toFixed(2)}`;
            return acaiprintItem;
          case 'milk_shake':
            const milkShake = item.product as MilkShakeDto;
            let milkShakePrintItem = '';
            let milkShakename = `${item.quantity}x Milk Shake ${milkShake.size.size.toFixed(0)} ml`;
            let milkShakePrice = `${(item.quantity * milkShake.size.price) < 10 ? `R$ ` : `R$`}${(item.quantity * milkShake.size.price).toFixed(2)}`;
            const milkDots = fillDots(44 - milkShakename.length - milkShakePrice.length);


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
              const name = `${additional.quantity} x ${additional.additional.name}${additional.isSeparated ? ' (SEPARADO)' : ''}`;
              const price = `${(additional.quantity * additional.additional.price) < 10 ? `R$ ` : `R$`}  ${(additional.quantity * additional.additional.price).toFixed(2)}`;
              const dots = fillDots(37 - name.length - price.length);
              milkShakePrintItem += `\n    ${name} ${dots} ${price}`;
            });
            if (item.observation) milkShakePrintItem += `\nObservação: ${item.observation}`;
            const milkSubtotal = calculateItemTotal(item);
            milkShakePrintItem += `\n\n${' '.repeat(34 - milkSubtotal.toFixed(2).length)}Subtotal: ${milkSubtotal < 10 ? 'R$ ' : 'R$'}${milkSubtotal.toFixed(2)}`;

            return milkShakePrintItem;
          case 'popsicle':
            const popsicles = (item.product as PopsiclesOrderDto).popsicles;
            let popsiclePrintItem = `Picolé`
            popsicles.forEach(popsicle => {
              const name = `${popsicle.popsicleQuantity}x ${popsicle.popsicle.name}`;
              const price = `${(popsicle.popsicleQuantity * popsicle.popsicle.price).toFixed(2)}`;
              popsiclePrintItem += `\n${name} ${fillDots(45 - name.length - price.length)} ${price}`;
            });
            return popsiclePrintItem;
          case 'drink':
            const drink = item.product as DrinkOrderDto;
            const drinkName = `${item.quantity}x ${drink.drink.name}`;
            const drinkPrice = `R$${(item.quantity * drink.drink.price).toFixed(2)}`;
            return `${drinkName} ${fillDots(45 - drinkName.length - drinkPrice.length)} ${drinkPrice}`;
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
            iceCreamPotPrintItem += `${iceCreamPotName} ${fillDots(45 - iceCreamPotName.length - iceCreamPotPrice.length)} ${iceCreamPotPrice}`;
            iceCreamPotPrintItem += `\n  Sabor: ${iceCreamPot.flavor.name}`;
            iceCreamPotPrintItem += `\n\n${' '.repeat(37 - iceCreamPotPrice.length)}Subtotal: ${iceCreamPotPrice}`
            return iceCreamPotPrintItem;
          case 'on_sale_acai':
            const onSaleAcai = item.product as OnSaleAcaiOrder;

            let onSaleAcaiPrintItem = '';

            const onSaleAcaiName = `${item.quantity * onSaleAcai.onSaleAcai.quantity}x Açaí PROMOÇÃO ${onSaleAcai.onSaleAcai.size.size.toFixed(0)} ml`;
            const onSaleAcaiPrice = `R$${(item.quantity * onSaleAcai.onSaleAcai.price).toFixed(2)}`;
            onSaleAcaiPrintItem += `${onSaleAcaiName} ${fillDots(45 - onSaleAcaiName.length - onSaleAcaiPrice.length)} ${onSaleAcaiPrice}`;
            const additionalRemoved = new Set(onSaleAcai.additionalRemoved.map(item => item.additional.id));
            const additionalsNotRemoved = onSaleAcai.onSaleAcai.additionals.filter(additional => !additionalRemoved.has(additional.additional.id));

            additionalsNotRemoved.forEach(additional => {
              const name = `1 x ${additional.additional.name}`;
              const price = `-`;

              const dots = fillDots(37 - name.length - price.length);
              onSaleAcaiPrintItem += `\n\t${name} ${dots} ${price}`;

            });

            if (onSaleAcai.additionalExtra.length !== 0) {
              onSaleAcaiPrintItem += '\n';
              onSaleAcaiPrintItem += '\n\t--------- Adicionais Extras ---------\n';
            }



            onSaleAcai.additionalExtra.forEach(additional => {
              const onSaleAcaiName = `${additional.quantity} x ${additional.additional.name}${additional.isSeparated ? ' (SEPARADO)' : ''}`;
              const onSaleAcaiPrice = `${(additional.quantity * additional.additional.price) < 10 ? `R$ ` : `R$`}${(additional.quantity * additional.additional.price).toFixed(2)}`;

              const dots = fillDots(37 - onSaleAcaiName.length - onSaleAcaiPrice.length);
              onSaleAcaiPrintItem += `\t${onSaleAcaiName} ${dots} ${onSaleAcaiPrice}\n`;
            });
            if (item.observation) onSaleAcaiPrintItem += `\nObservação: ${item.observation}`;
            return onSaleAcaiPrintItem;

          case 'other_product':
            const otherProduct = item.product as OtherProductOrder;
            let otherProductPrintItem = '';
            const otherProductName = `${item.quantity}x ${otherProduct.otherProduct.name}`;
            const otherProductPrice = `R$${(item.quantity * otherProduct.otherProduct.price).toFixed(2)}`;
            otherProductPrintItem += `${otherProductName} ${fillDots(45 - otherProductName.length - otherProductPrice.length)} ${otherProductPrice}`;
            if (item.observation) otherProductPrintItem += `\nObservação: ${item.observation}`;
            return otherProductPrintItem;
          default:
            return '';
        }
      }).map((text, index) => (
        // Pedido misto: o LEVAR do topo não sai, então cada item marcado leva o seu.
        !allToTake && isItemToTake(itemsToPrint[index]) ? `*** LEVAR ***\n${text}` : text
      )).join(`\n-----------------------------------------------\n\n`);

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
        return `Troco para: R$${order.cashChange.toFixed(2)}\nValor do troco: R$${(order.cashChange - calculateOrderTotal(order.products, order.deliveryFee)).toFixed(2)}`;
      }
      return '';
    }

    // Retirada no balcão já paga sai com "PAGO" para o atendente não cobrar de novo.
    function formatTotal(order: OrderDto) {
      const total = `Total: R$${calculateOrderTotal(order.products, order.deliveryFee).toFixed(2)}`;
      const isPaid = order.isInStorePickup && order.products.length > 0 && order.products.every(item => item.isPaid);
      return isPaid ? `${total}\nPAGO` : total;
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
      if (allToTake) {
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
              .text(env.storeName)
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
              .text(formatTotal(orderDetails))
              .text(getChange(orderDetails))
              .drawLine()
              .feed(1)
              .cut();
          }

          // Via do Cliente
          if (orderDetails.type === 'Store' || printAll) {
            printer
              .align('CT')
              .text(env.storeName)
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
              .text(formatTotal(orderDetails))
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
              ptPrinter.println(env.storeName);
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
              ptPrinter.println(formatTotal(orderDetails));
              ptPrinter.println(getChange(orderDetails));
              ptPrinter.drawLine();
              ptPrinter.println('');
              ptPrinter.cut();
            }

            // Via do Cliente
            if (orderDetails.type === 'Store' || printAll) {
              ptPrinter.alignCenter();
              ptPrinter.println(env.storeName);
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
              ptPrinter.println(formatTotal(orderDetails));
              ptPrinter.println(getChange(orderDetails));
              ptPrinter.drawLine();
              ptPrinter.println('');
              ptPrinter.cut();
            }

            const buffer = ptPrinter.getBuffer();
            const port = new SerialPort({
              path: env.printerSerialPort,
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
            console.error(`Erro ao imprimir via Bluetooth (${env.printerSerialPort}) - Tentativa ${attempt} de 5:`, btError);
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

import { Test, TestingModule } from '@nestjs/testing';
import { PrinterService } from './printer.service';

const mockPrinted: string[] = [];

jest.mock('escpos-usb', () => ({ getDevice: jest.fn().mockResolvedValue({}) }));
jest.mock('escpos', () => {
  class Printer {
    text(value: string) {
      mockPrinted.push(value);
      return this;
    }
    align() { return this; }
    feed() { return this; }
    drawLine() { return this; }
    cut() { return this; }
    flush(callback: () => void) { callback(); }
    close(callback: () => void) { callback(); }
  }
  return { Printer, Image: { load: jest.fn() } };
});

describe('PrinterService', () => {
  let service: PrinterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrinterService],
    }).compile();

    service = module.get<PrinterService>(PrinterService);
    mockPrinted.length = 0;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('para levar por item', () => {
    const acai = (toTake: boolean) => ({
      id: toTake ? 'levar' : 'local',
      quantity: 1,
      productType: 'acai',
      status: true,
      isPaid: false,
      toTake,
      product: { size: { size: 500, price: 10 }, additionals: [], inCup: false, isJuice: false },
    });

    // Só a via do estabelecimento e a do cliente passam pelo mesmo montador.
    const print = async (products: unknown[], orderToTake = false) => {
      await service.printOrder({
        productId: 1,
        date: new Date(),
        clientName: 'Ana',
        type: 'Store',
        toTake: orderToTake,
        isInStorePickup: false,
        products,
      } as never, false);
      return mockPrinted.join('\n');
    };

    const count = (text: string, part: string) => text.split(part).length - 1;

    it('todos os itens: LEVAR só no topo e sem tigela', async () => {
      const text = await print([acai(true), acai(true)]);

      expect(mockPrinted).toContain('LEVAR');
      expect(text).not.toContain('*** LEVAR ***');
      expect(text).not.toContain('(TIGELA)');
    });

    it('nenhum item: sem LEVAR e com tigela', async () => {
      const text = await print([acai(false)]);

      expect(text).not.toContain('LEVAR');
      expect(text).toContain('(TIGELA)');
    });

    it('alguns itens: LEVAR só no item marcado', async () => {
      const text = await print([acai(true), acai(false)]);

      expect(mockPrinted).not.toContain('LEVAR');
      // Uma marcação por via: estabelecimento e cliente.
      expect(count(text, '*** LEVAR ***')).toBe(2);
      // A tigela só sai na via do estabelecimento, para o item consumido no local.
      expect(count(text, '(TIGELA)')).toBe(1);
    });

    it('pedido antigo: toTake do pedido vale para todos', async () => {
      const text = await print([acai(false)], true);

      expect(mockPrinted).toContain('LEVAR');
      expect(text).not.toContain('*** LEVAR ***');
      expect(text).not.toContain('(TIGELA)');
    });
  });
});

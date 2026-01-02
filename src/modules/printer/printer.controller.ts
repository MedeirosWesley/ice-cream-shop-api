import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PrinterService } from './printer.service';

@Controller('printer')
export class PrinterController {
  constructor(private readonly printerService: PrinterService) { }

  @Get(':name')
  printName(@Param('name') name: string) {
    return this.printerService.printName(name);
  }

  @Post()
  printImage(@Body() imageUrl: string) {
    return this.printerService.printImage(imageUrl);
  }
}

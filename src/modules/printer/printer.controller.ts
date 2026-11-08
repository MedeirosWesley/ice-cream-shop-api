import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { PrintImageDto } from './dto/print-image.dto';

@Controller('printer')
export class PrinterController {
  constructor(private readonly printerService: PrinterService) { }

  @Get(':name')
  printName(@Param('name') name: string) {
    return this.printerService.printName(name);
  }

  @Post()
  printImage(@Body() printImageDto: PrintImageDto) {
    return this.printerService.printImage(printImageDto.imageUrl);
  }
}

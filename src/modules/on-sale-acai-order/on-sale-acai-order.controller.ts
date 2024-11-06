import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OnSaleAcaiOrderService } from './on-sale-acai-order.service';
import { CreateOnSaleAcaiOrderDto } from './dto/create-on-sale-acai-order.dto';
import { UpdateOnSaleAcaiOrderDto } from './dto/update-on-sale-acai-order.dto';

@Controller('on-sale-acai-order')
export class OnSaleAcaiOrderController {
  constructor(private readonly onSaleAcaiOrderService: OnSaleAcaiOrderService) { }

  @Post()
  create(@Body() createOnSaleAcaiOrderDto: CreateOnSaleAcaiOrderDto) {
    return this.onSaleAcaiOrderService.create(createOnSaleAcaiOrderDto);
  }

  @Get()
  findAll() {
    return this.onSaleAcaiOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.onSaleAcaiOrderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOnSaleAcaiOrderDto: UpdateOnSaleAcaiOrderDto) {
    return this.onSaleAcaiOrderService.update(id, updateOnSaleAcaiOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.onSaleAcaiOrderService.remove(id);
  }
}

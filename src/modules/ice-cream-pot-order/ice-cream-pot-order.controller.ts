import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IceCreamPotOrderService } from './ice-cream-pot-order.service';
import { CreateIceCreamPotOrderDto } from './dto/create-ice-cream-pot-order.dto';
import { UpdateIceCreamPotOrderDto } from './dto/update-ice-cream-pot-order.dto';

@Controller('ice-cream-pot-order')
export class IceCreamPotOrderController {
  constructor(private readonly iceCreamPotOrderService: IceCreamPotOrderService) { }

  @Post()
  create(@Body() createIceCreamPotOrderDto: CreateIceCreamPotOrderDto) {
    return this.iceCreamPotOrderService.create(createIceCreamPotOrderDto);
  }

  @Get()
  findAll() {
    return this.iceCreamPotOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.iceCreamPotOrderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIceCreamPotOrderDto: UpdateIceCreamPotOrderDto) {
    return this.iceCreamPotOrderService.update(id, updateIceCreamPotOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.iceCreamPotOrderService.remove(id);
  }
}

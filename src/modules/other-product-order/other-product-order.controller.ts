import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OtherProductOrderService } from './other-product-order.service';
import { CreateOtherProductOrderDto } from './dto/create-other-product-order.dto';
import { UpdateOtherProductOrderDto } from './dto/update-other-product-order.dto';

@Controller('other-product-order')
export class OtherProductOrderController {
  constructor(private readonly otherProductOrderService: OtherProductOrderService) { }

  @Post()
  create(@Body() createOtherProductOrderDto: CreateOtherProductOrderDto) {
    return this.otherProductOrderService.create(createOtherProductOrderDto);
  }

  @Get()
  findAll() {
    return this.otherProductOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.otherProductOrderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOtherProductOrderDto: UpdateOtherProductOrderDto) {
    return this.otherProductOrderService.update(id, updateOtherProductOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.otherProductOrderService.remove(id);
  }
}

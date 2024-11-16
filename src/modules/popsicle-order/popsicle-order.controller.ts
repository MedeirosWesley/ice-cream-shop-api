import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PopsicleOrderService } from './popsicle-order.service';
import { CreatePopsicleOrderDto, CreatePopsiclesOrderDto } from './dto/create-popsicle-order.dto';
import { UpdatePopsicleOrderDto } from './dto/update-popsicle-order.dto';
import { plainToInstance } from 'class-transformer';
import { PopsicleOrderDto } from './dto/popsicle-order.dto';
import { PopsiclesOrderDto } from './dto/popsicles-order.dto';

@Controller('popsicle-order')
export class PopsicleOrderController {
  constructor(private readonly popsicleOrderService: PopsicleOrderService) { }

  @Post()
  create(@Body() createPopsicleOrderDto: CreatePopsiclesOrderDto) {
    return this.popsicleOrderService.create(createPopsicleOrderDto);
  }

  @Get()
  findAll() {
    return this.popsicleOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.popsicleOrderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePopsicleOrderDto: UpdatePopsicleOrderDto) {
    return this.popsicleOrderService.update(id, updatePopsicleOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.popsicleOrderService.remove(id);
  }
}

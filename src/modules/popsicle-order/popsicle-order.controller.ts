import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PopsicleOrderService } from './popsicle-order.service';
import { CreatePopsicleOrderDto, CreatePopsiclesOrderDto } from './dto/create-popsicle-order.dto';
import { UpdatePopsicleOrderDto } from './dto/update-popsicle-order.dto';
import { plainToInstance } from 'class-transformer';
import { PopsicleOrderDto } from './dto/popsicle-order.dto';

@Controller('popsicle-order')
export class PopsicleOrderController {
  constructor(private readonly popsicleOrderService: PopsicleOrderService) { }

  @Post()
  create(@Body() createPopsicleOrderDto: CreatePopsiclesOrderDto) {
    return plainToInstance(PopsicleOrderDto, this.popsicleOrderService.create(createPopsicleOrderDto), { excludeExtraneousValues: true });
  }

  @Get()
  findAll() {
    return plainToInstance(PopsicleOrderDto, this.popsicleOrderService.findAll(), { excludeExtraneousValues: true });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return plainToInstance(PopsicleOrderDto, this.popsicleOrderService.findOne(id), { excludeExtraneousValues: true });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePopsicleOrderDto: UpdatePopsicleOrderDto) {
    return plainToInstance(PopsicleOrderDto, this.popsicleOrderService.update(id, updatePopsicleOrderDto), { excludeExtraneousValues: true });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.popsicleOrderService.remove(id);
  }
}

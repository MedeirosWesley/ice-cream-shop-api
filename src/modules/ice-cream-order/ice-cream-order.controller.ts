import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IceCreamOrderService } from './ice-cream-order.service';
import { CreateIceCreamOrderDto } from './dto/create-ice-cream-order.dto';
import { UpdateIceCreamOrderDto } from './dto/update-ice-cream-order.dto';
import { IceCreamOrderDto } from './dto/ice-cream-order.dto';
import { plainToInstance } from 'class-transformer';

@Controller('ice-cream-order')
export class IceCreamOrderController {
  constructor(private readonly iceCreamOrderService: IceCreamOrderService) { }

  @Post()
  create(@Body() createIceCreamOrderDto: CreateIceCreamOrderDto) {
    return plainToInstance(IceCreamOrderDto, this.iceCreamOrderService.create(createIceCreamOrderDto), { excludeExtraneousValues: true });
  }

  @Get()
  findAll() {
    return plainToInstance(IceCreamOrderDto, this.iceCreamOrderService.findAll(), { excludeExtraneousValues: true });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return plainToInstance(IceCreamOrderDto, this.iceCreamOrderService.findOne(id), { excludeExtraneousValues: true });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIceCreamOrderDto: UpdateIceCreamOrderDto) {
    return plainToInstance(IceCreamOrderDto, this.iceCreamOrderService.update(id, updateIceCreamOrderDto), { excludeExtraneousValues: true });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.iceCreamOrderService.remove(id);
  }
}

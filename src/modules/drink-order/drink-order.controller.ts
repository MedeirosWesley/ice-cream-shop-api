import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DrinkOrderService } from './drink-order.service';
import { CreateDrinkOrderDto } from './dto/create-drink-order.dto';
import { UpdateDrinkOrderDto } from './dto/update-drink-order.dto';
import { DrinkOrderDto } from './dto/drink-order.dto';
import { plainToInstance } from 'class-transformer';

@Controller('drink-order')
export class DrinkOrderController {
  constructor(private readonly drinkOrderService: DrinkOrderService) { }

  @Post()
  create(@Body() createDrinkOrderDto: CreateDrinkOrderDto) {
    return plainToInstance(DrinkOrderDto, this.drinkOrderService.create(createDrinkOrderDto), { excludeExtraneousValues: true });
  }

  @Get()
  findAll() {
    return plainToInstance(DrinkOrderDto, this.drinkOrderService.findAll(), { excludeExtraneousValues: true });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return plainToInstance(DrinkOrderDto, this.drinkOrderService.findOne(id), { excludeExtraneousValues: true });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDrinkOrderDto: UpdateDrinkOrderDto) {
    return plainToInstance(DrinkOrderDto, this.drinkOrderService.update(id, updateDrinkOrderDto), { excludeExtraneousValues: true });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drinkOrderService.remove(id);
  }
}

import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { DrinkService } from './drink.service';
import { CreateDrinkDto } from './dto/create-drink.dto';
import { UpdateDrinkDto } from './dto/update-drink.dto';
import { ParseIntPipe } from '@nestjs/common';
import { Drink } from './entities/drink.entity';

@Controller('drinks')
export class DrinkController {
  constructor(private readonly drinkService: DrinkService) { }

  @Post()
  create(@Body() createDrinkDto: CreateDrinkDto): Promise<Drink> {
    return this.drinkService.create(createDrinkDto);
  }

  @Get()
  findAll(): Promise<Drink[]> {
    return this.drinkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Drink> {
    return this.drinkService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDrinkDto: UpdateDrinkDto,
  ): Promise<Drink> {
    return this.drinkService.update(id, updateDrinkDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.drinkService.remove(id);
  }
}

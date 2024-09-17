import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { MotorcycleCourierService } from './motorcycle_courier.service';
import { ParseUUIDPipe } from '@nestjs/common';
import { CreateMotorcycleCourierDto } from './dto/create-motorcycle_courier.dto';
import { MotorcycleCourier } from './entities/motorcycle_courier.entity';
import { UpdateMotorcycleCourierDto } from './dto/update-motorcycle_courier.dto';

@Controller('motorcycle-couriers')
export class MotorcycleCourierController {
  constructor(private readonly motorcycleCourierService: MotorcycleCourierService) { }

  @Post()
  create(@Body() createMotorcycleCourierDto: CreateMotorcycleCourierDto): Promise<MotorcycleCourier> {
    return this.motorcycleCourierService.create(createMotorcycleCourierDto);
  }

  @Get()
  findAll(): Promise<MotorcycleCourier[]> {
    return this.motorcycleCourierService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MotorcycleCourier> {
    return this.motorcycleCourierService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMotorcycleCourierDto: UpdateMotorcycleCourierDto,
  ): Promise<MotorcycleCourier> {
    return this.motorcycleCourierService.update(id, updateMotorcycleCourierDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.motorcycleCourierService.remove(id);
  }
}

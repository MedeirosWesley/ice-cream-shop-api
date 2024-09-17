import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { CreateIceCreamSyrupDto } from './dto/create-ice-cream-syrup.dto';
import { UpdateIceCreamSyrupDto } from './dto/update-ice-cream-syrup.dto';
import { ParseUUIDPipe } from '@nestjs/common';
import { IceCreamSyrupService } from './ice-cream-syrup.service';
import { IceCreamSyrup } from './entities/ice-cream-syrup.entity';

@Controller('ice-cream-syrups')
export class IceCreamSyrupController {
  constructor(private readonly iceCreamSyrupService: IceCreamSyrupService) { }

  @Post()
  create(@Body() createIceCreamSyrupDto: CreateIceCreamSyrupDto): Promise<IceCreamSyrup> {
    return this.iceCreamSyrupService.create(createIceCreamSyrupDto);
  }

  @Get()
  findAll(): Promise<IceCreamSyrup[]> {
    return this.iceCreamSyrupService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<IceCreamSyrup> {
    return this.iceCreamSyrupService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateIceCreamSyrupDto: UpdateIceCreamSyrupDto,
  ): Promise<IceCreamSyrup> {
    return this.iceCreamSyrupService.update(id, updateIceCreamSyrupDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.iceCreamSyrupService.remove(id);
  }
}

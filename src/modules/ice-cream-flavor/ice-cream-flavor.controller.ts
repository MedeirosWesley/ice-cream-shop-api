import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { CreateIceCreamFlavorDto } from './dto/create-ice-cream-flavor.dto';
import { UpdateIceCreamFlavorDto } from './dto/update-ice-cream-flavor.dto';
import { ParseUUIDPipe } from '@nestjs/common';
import { IceCreamFlavor } from './entities/ice-cream-flavor.entity';
import { IceCreamFlavorService } from './ice-cream-flavor.service';

@Controller('ice-cream-flavors')
export class IceCreamFlavorController {
  constructor(private readonly iceCreamFlavorService: IceCreamFlavorService) { }

  @Post()
  create(@Body() createIceCreamFlavorDto: CreateIceCreamFlavorDto): Promise<IceCreamFlavor> {
    return this.iceCreamFlavorService.create(createIceCreamFlavorDto);
  }

  @Get()
  findAll(): Promise<IceCreamFlavor[]> {
    return this.iceCreamFlavorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<IceCreamFlavor> {
    return this.iceCreamFlavorService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateIceCreamFlavorDto: UpdateIceCreamFlavorDto,
  ): Promise<IceCreamFlavor> {
    return this.iceCreamFlavorService.update(id, updateIceCreamFlavorDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.iceCreamFlavorService.remove(id);
  }
}

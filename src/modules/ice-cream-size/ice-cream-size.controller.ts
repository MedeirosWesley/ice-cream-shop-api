import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { IceCreamSizeService } from './ice-cream-size.service';
import { IceCreamSize } from './entities/ice-cream-size.entity';
import { CreateIceCreamSizeDto } from './dto/create-ice-cream-size.dto';
import { UpdateIceCreamSizeDto } from './dto/update-ice-cream-size.dto';


@Controller('ice-cream-sizes')
export class IceCreamSizeController {
  constructor(private readonly iceCreamSizeService: IceCreamSizeService) { }

  @Post()
  create(@Body() createIceCreamSizeDto: CreateIceCreamSizeDto): Promise<IceCreamSize> {
    return this.iceCreamSizeService.create(createIceCreamSizeDto);
  }

  @Get()
  findAll(): Promise<IceCreamSize[]> {
    return this.iceCreamSizeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IceCreamSize> {
    return this.iceCreamSizeService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateIceCreamSizeDto: UpdateIceCreamSizeDto,
  ): Promise<IceCreamSize> {
    return this.iceCreamSizeService.update(id, updateIceCreamSizeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.iceCreamSizeService.remove(id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { OnSaleAcaiService } from './on-sale-acai.service';
import { CreateOnSaleAcaiDto } from './dto/create-on-sale-acai.dto';
import { UpdateOnSaleAcaiDto } from './dto/update-on-sale-acai.dto';

@Controller('on-sale-acai')
export class OnSaleAcaiController {
  constructor(private readonly onSaleAcaiService: OnSaleAcaiService) { }

  @Post()
  create(@Body() createOnSaleAcaiDto: CreateOnSaleAcaiDto) {
    return this.onSaleAcaiService.create(createOnSaleAcaiDto);
  }

  @Get()
  findAll() {
    return this.onSaleAcaiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.onSaleAcaiService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOnSaleAcaiDto: UpdateOnSaleAcaiDto) {
    return this.onSaleAcaiService.update(id, updateOnSaleAcaiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.onSaleAcaiService.remove(id);
  }
}

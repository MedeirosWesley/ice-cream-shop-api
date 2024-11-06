import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OtherProductService } from './other-product.service';
import { CreateOtherProductDto } from './dto/create-other-product.dto';
import { UpdateOtherProductDto } from './dto/update-other-product.dto';

@Controller('other-product')
export class OtherProductController {
  constructor(private readonly otherProductService: OtherProductService) { }

  @Post()
  create(@Body() createOtherProductDto: CreateOtherProductDto) {
    return this.otherProductService.create(createOtherProductDto);
  }

  @Get()
  findAll() {
    return this.otherProductService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.otherProductService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOtherProductDto: UpdateOtherProductDto) {
    return this.otherProductService.update(id, updateOtherProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.otherProductService.remove(id);
  }
}

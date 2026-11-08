import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
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

  // Precisa vir antes de @Get(':id'), senão o findOne engole a rota.
  @Get('top')
  findTop(
    @Query('limit') limit?: string,
    @Query('days') days?: string,
    @Query('type') type?: string,
  ) {
    return this.onSaleAcaiService.findTop(
      Math.max(1, Number(limit) || 4),
      Math.max(1, Number(days) || 30),
      type,
    );
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

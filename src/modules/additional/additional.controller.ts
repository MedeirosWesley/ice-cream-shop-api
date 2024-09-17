import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { AdditionalService } from './additional.service';
import { CreateAdditionalDto } from './dto/create-additional.dto';
import { UpdateAdditionalDto } from './dto/update-additional.dto';
import { Additional } from './entities/additional.entity';

@Controller('additional')
export class AdditionalController {
  constructor(private readonly additionalService: AdditionalService) { }

  @Post()
  create(@Body() createAdditionalDto: CreateAdditionalDto): Promise<Additional> {
    return this.additionalService.create(createAdditionalDto);
  }

  @Get()
  findAll(): Promise<Additional[]> {
    return this.additionalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Additional> {
    return this.additionalService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateAdditionalDto: UpdateAdditionalDto,
  ): Promise<Additional> {
    return this.additionalService.update(id, updateAdditionalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.additionalService.remove(id);
  }
}

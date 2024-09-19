import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AcaiService } from './acai.service';
import { CreateAcaiDto } from './dto/create-acai.dto';
import { UpdateAcaiDto } from './dto/update-acai.dto';

@Controller('acai')
export class AcaiController {
  constructor(private readonly acaiService: AcaiService) { }

  @Post()
  create(@Body() createAcaiDto: CreateAcaiDto) {
    return this.acaiService.create(createAcaiDto);
  }

  @Get()
  findAll() {
    return this.acaiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.acaiService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAcaiDto: UpdateAcaiDto) {
    return this.acaiService.update(id, updateAcaiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.acaiService.remove(id);
  }
}

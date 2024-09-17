import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PopsicleService } from './popsicle.service';
import { CreatePopsicleDto } from './dto/create-popsicle.dto';
import { UpdatePopsicleDto } from './dto/update-popsicle.dto';
import { Popsicle } from './entities/popsicle.entity';

@Controller('popsicles')
export class PopsicleController {
  constructor(private readonly popsicleService: PopsicleService) { }

  @Post()
  create(@Body() createPopsicleDto: CreatePopsicleDto): Promise<Popsicle> {
    return this.popsicleService.create(createPopsicleDto);
  }

  @Get()
  findAll(): Promise<Popsicle[]> {
    return this.popsicleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Popsicle> {
    return this.popsicleService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePopsicleDto: UpdatePopsicleDto,
  ): Promise<Popsicle> {
    return this.popsicleService.update(+id, updatePopsicleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.popsicleService.remove(+id);
  }
}

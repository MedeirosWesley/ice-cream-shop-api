import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MilkShakeService } from './milk-shake.service';
import { CreateMilkShakeDto } from './dto/create-milk-shake.dto';
import { UpdateMilkShakeDto } from './dto/update-milk-shake.dto';
import { MilkShakeDto } from './dto/milk-shake.dto';
import { plainToInstance } from 'class-transformer';

@Controller('milk-shake')
export class MilkShakeController {
  constructor(private readonly milkShakeService: MilkShakeService) { }

  @Post()
  create(@Body() createMilkShakeDto: CreateMilkShakeDto) {
    return plainToInstance(MilkShakeDto, this.milkShakeService.create(createMilkShakeDto), { excludeExtraneousValues: true });
  }

  @Get()
  findAll() {
    return plainToInstance(MilkShakeDto, this.milkShakeService.findAll(), { excludeExtraneousValues: true });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.milkShakeService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMilkShakeDto: UpdateMilkShakeDto) {
    return this.milkShakeService.update(id, updateMilkShakeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.milkShakeService.remove(id);
  }
}

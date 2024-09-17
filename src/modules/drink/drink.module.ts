import { Module } from '@nestjs/common';
import { DrinkService } from './drink.service';
import { DrinkController } from './drink.controller';
import { Drink } from './entities/drink.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Drink])],
  controllers: [DrinkController],
  providers: [DrinkService],
})
export class DrinkModule { }

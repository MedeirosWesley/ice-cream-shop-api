import { Module } from '@nestjs/common';
import { PopsicleService } from './popsicle.service';
import { PopsicleController } from './popsicle.controller';
import { Popsicle } from './entities/popsicle.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Popsicle])],
  controllers: [PopsicleController],
  providers: [PopsicleService],
})
export class PopsicleModule { }

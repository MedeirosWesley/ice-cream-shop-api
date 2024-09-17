import { Module } from '@nestjs/common';
import { AdditionalService } from './additional.service';
import { AdditionalController } from './additional.controller';
import { Additional } from './entities/additional.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Additional])],
  controllers: [AdditionalController],
  providers: [AdditionalService],
})
export class AdditionalModule { }

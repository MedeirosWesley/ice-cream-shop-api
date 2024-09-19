import { Module } from '@nestjs/common';
import { AcaiService } from './acai.service';
import { AcaiController } from './acai.controller';
import { Acai } from './entities/acai.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Additional } from '../additional/entities/additional.entity';
import { OrderAdditional } from '../order/entities/order-additional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Acai, OrderAdditional])],
  controllers: [AcaiController],
  providers: [AcaiService],
})
export class AcaiModule { }

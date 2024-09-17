import { Module } from '@nestjs/common';
import { MotorcycleCourierService } from './motorcycle_courier.service';
import { MotorcycleCourierController } from './motorcycle_courier.controller';
import { MotorcycleCourier } from './entities/motorcycle_courier.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([MotorcycleCourier])],
  controllers: [MotorcycleCourierController],
  providers: [MotorcycleCourierService],
})
export class MotorcycleCourierModule { }

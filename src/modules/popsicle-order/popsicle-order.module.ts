import { Module } from '@nestjs/common';
import { PopsicleOrderService } from './popsicle-order.service';
import { PopsicleOrderController } from './popsicle-order.controller';
import { PopsicleOrder } from './entities/popsicle-order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PopsiclesOrder } from './entities/popsicles-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PopsicleOrder, PopsiclesOrder])],
  controllers: [PopsicleOrderController],
  providers: [PopsicleOrderService],
  exports: [PopsicleOrderService],
})
export class PopsicleOrderModule { }

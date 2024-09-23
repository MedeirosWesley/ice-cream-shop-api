import { Module } from '@nestjs/common';
import { PopsicleOrderService } from './popsicle-order.service';
import { PopsicleOrderController } from './popsicle-order.controller';
import { PopsicleOrder } from './entities/popsicle-order.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([PopsicleOrder])],
  controllers: [PopsicleOrderController],
  providers: [PopsicleOrderService],
})
export class PopsicleOrderModule { }

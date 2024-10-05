import { Module } from '@nestjs/common';
import { MilkShakeService } from './milk-shake.service';
import { MilkShakeController } from './milk-shake.controller';
import { MilkShake } from './entities/milk-shake.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MilkshakeIceCreamFlavor } from '../ice-cream-flavor/entities/milk-shake-ice-cream-flavor.entity';
import { IceCreamFlavor } from '../ice-cream-flavor/entities/ice-cream-flavor.entity';
import { Additional } from '../additional/entities/additional.entity';
import { MilkShakeAdditional } from './entities/milk-shake-additional.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MilkShake, MilkShakeAdditional, Additional, IceCreamFlavor, MilkshakeIceCreamFlavor])],
  controllers: [MilkShakeController],
  providers: [MilkShakeService],
  exports: [MilkShakeService],
})
export class MilkShakeModule { }

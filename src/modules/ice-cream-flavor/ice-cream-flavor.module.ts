import { Module } from '@nestjs/common';
import { IceCreamFlavorService } from './ice-cream-flavor.service';
import { IceCreamFlavorController } from './ice-cream-flavor.controller';
import { IceCreamFlavor } from './entities/ice-cream-flavor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([IceCreamFlavor])],
  controllers: [IceCreamFlavorController],
  providers: [IceCreamFlavorService],
})
export class IceCreamFlavorModule { }

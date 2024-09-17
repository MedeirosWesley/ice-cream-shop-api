import { Module } from '@nestjs/common';
import { IceCreamSizeService } from './ice-cream-size.service';
import { IceCreamSizeController } from './ice-cream-size.controller';
import { IceCreamSize } from './entities/ice-cream-size.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([IceCreamSize])],
  controllers: [IceCreamSizeController],
  providers: [IceCreamSizeService],
})
export class IceCreamSizeModule { }

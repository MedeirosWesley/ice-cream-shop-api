import { Module } from '@nestjs/common';
import { IceCreamSyrupService } from './ice-cream-syrup.service';
import { IceCreamSyrupController } from './ice-cream-syrup.controller';
import { IceCreamSyrup } from './entities/ice-cream-syrup.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([IceCreamSyrup])],
  controllers: [IceCreamSyrupController],
  providers: [IceCreamSyrupService],
})
export class IceCreamSyrupModule { }

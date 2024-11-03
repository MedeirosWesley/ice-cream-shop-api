import { Module } from '@nestjs/common';
import { OnSaleAcaiService } from './on-sale-acai.service';
import { OnSaleAcaiController } from './on-sale-acai.controller';
import { OnSaleAcai } from './entities/on-sale-acai.entity';
import { AcaiAdditionalOnSale } from './entities/acai_additional-on-sale.entity';
import { Additional } from '../additional/entities/additional.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([OnSaleAcai, AcaiAdditionalOnSale, Additional])],
  controllers: [OnSaleAcaiController],
  providers: [OnSaleAcaiService],
})
export class OnSaleAcaiModule { }

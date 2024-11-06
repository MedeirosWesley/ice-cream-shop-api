import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './modules/client/client.module';
import { TypeOrmConfig } from './modules/config/typeorm/typeorm.module';
import { AdditionalModule } from './modules/additional/additional.module';
import { DrinkModule } from './modules/drink/drink.module';
import { IceCreamFlavorModule } from './modules/ice-cream-flavor/ice-cream-flavor.module';
import { IceCreamSyrupModule } from './modules/ice-cream-syrup/ice-cream-syrup.module';
import { MotorcycleCourierModule } from './modules/motorcycle_courier/motorcycle_courier.module';
import { PopsicleModule } from './modules/popsicle/popsicle.module';
import { IceCreamSizeModule } from './modules/ice-cream-size/ice-cream-size.module';
import { OrderModule } from './modules/order/order.module';
import { AcaiModule } from './modules/acai/acai.module';
import { MilkShakeModule } from './modules/milk-shake/milk-shake.module';
import { PopsicleOrderModule } from './modules/popsicle-order/popsicle-order.module';
import { DrinkOrderModule } from './modules/drink-order/drink-order.module';
import { IceCreamOrderModule } from './modules/ice-cream-order/ice-cream-order.module';
import { PrinterModule } from './modules/printer/printer.module';
import { IceCreamPotOrderModule } from './modules/ice-cream-pot-order/ice-cream-pot-order.module';
import { OnSaleAcaiModule } from './modules/on-sale-acai/on-sale-acai.module';
import { OnSaleAcaiOrderModule } from './modules/on-sale-acai-order/on-sale-acai-order.module';
import { OtherProductModule } from './modules/other-product/other-product.module';
import { OtherProductOrderModule } from './modules/other-product-order/other-product-order.module';

@Module({
  imports: [
    ClientModule,
    TypeOrmConfig,
    AdditionalModule,
    DrinkModule,
    IceCreamFlavorModule,
    IceCreamSyrupModule,
    MotorcycleCourierModule,
    PopsicleModule,
    IceCreamSizeModule,
    OrderModule,
    AcaiModule,
    MilkShakeModule,
    PopsicleOrderModule,
    DrinkOrderModule,
    IceCreamOrderModule,
    PrinterModule,
    IceCreamPotOrderModule,
    OnSaleAcaiModule,
    OnSaleAcaiOrderModule,
    OtherProductModule,
    OtherProductOrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

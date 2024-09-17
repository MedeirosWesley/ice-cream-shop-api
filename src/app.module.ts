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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

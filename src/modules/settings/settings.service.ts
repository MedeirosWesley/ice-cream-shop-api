import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { env } from '../config/env';

const DELIVERY_FEE_KEY = 'deliveryFee';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,
  ) { }

  /** Taxa vigente para pedidos novos. Sem valor salvo, vale o DELIVERY_FEE do ambiente. */
  async getDeliveryFee(): Promise<number> {
    const setting = await this.settingRepository.findOneBy({ key: DELIVERY_FEE_KEY });
    // Colunas decimal voltam como string no SQLite
    return setting ? Number(setting.value) : env.deliveryFee;
  }

  async setDeliveryFee(value: number): Promise<number> {
    await this.settingRepository.save({ key: DELIVERY_FEE_KEY, value });
    return value;
  }
}

import { Body, Controller, Get, Put } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateDeliveryFeeDto } from './dto/update-delivery-fee.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Get('delivery-fee')
  async getDeliveryFee(): Promise<{ value: number }> {
    return { value: await this.settingsService.getDeliveryFee() };
  }

  @Put('delivery-fee')
  async updateDeliveryFee(@Body() dto: UpdateDeliveryFeeDto): Promise<{ value: number }> {
    return { value: await this.settingsService.setDeliveryFee(dto.value) };
  }
}

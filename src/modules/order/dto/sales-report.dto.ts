export class SalesReportPeriodDto {
  startDate: string;
  endDate: string;
  days: number;
}

export class SalesReportSummaryDto {
  total: number;
  orders: number;
  averageTicket: number;
  deliveryFees: number;
}

export class SalesByTypeDto {
  type: string;
  total: number;
  orders: number;
  averageTicket: number;
}

export class SalesByPaymentMethodDto {
  paymentMethod: string;
  total: number;
  orders: number;
}

export class SalesByDayDto {
  date: string;
  total: number;
  orders: number;
  delivery: number;
  store: number;
}

export class SalesByProductTypeDto {
  productType: string;
  total: number;
  quantity: number;
}

export class SalesReportDto {
  period: SalesReportPeriodDto;
  summary: SalesReportSummaryDto;
  byType: SalesByTypeDto[];
  byPaymentMethod: SalesByPaymentMethodDto[];
  byDay: SalesByDayDto[];
  byProductType?: SalesByProductTypeDto[];
}

import { IsDateString, IsIn, IsOptional } from "class-validator";

export class SalesReportQueryDto {

  @IsOptional()
  @IsDateString({}, { message: "startDate deve ser uma data válida (YYYY-MM-DD)" })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: "endDate deve ser uma data válida (YYYY-MM-DD)" })
  endDate?: string;

  // O ValidationPipe global não usa transform, então query params chegam como string.
  @IsOptional()
  @IsIn(['true', 'false'], { message: "includeProducts deve ser 'true' ou 'false'" })
  includeProducts?: string;
}

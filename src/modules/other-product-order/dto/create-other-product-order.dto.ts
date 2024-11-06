import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateOtherProductOrderDto {
  @IsUUID()
  @IsNotEmpty()
  otherProductId: string;
}

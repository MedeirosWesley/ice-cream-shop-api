import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateClientDto {
  @IsNumber()
  id: number;
  @IsNotEmpty({ message: "O Telefone não pode ser vazio!" })
  @IsString()
  phone: string;
  @IsNotEmpty({ message: "O Nome não pode ser vazio!" })
  @IsString()
  name: string;
  @IsNotEmpty({ message: "A Rua não pode ser vazia!" })
  @IsString()
  street: string;
  @IsNotEmpty({ message: "O Bairro não pode ser vazio!" })
  @IsString()
  neighborhood: string;
  @IsNotEmpty({ message: "O Número da casa não pode ser vazio!" })
  @IsNumber()
  houseNumber: number;
  @IsString()
  reference: string;
}

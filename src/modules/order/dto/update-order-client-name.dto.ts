import { IsString, Matches } from 'class-validator';

export class UpdateOrderClientNameDto {
  // `@IsNotEmpty` deixaria passar uma string só de espaços, que o serviço
  // gravaria como nome vazio depois do `trim()`. O `\S` exige ao menos um
  // caractere visível e já cobre o caso da string vazia.
  @Matches(/\S/, { message: 'O Nome não pode ser vazio!' })
  @IsString()
  clientName: string;
}

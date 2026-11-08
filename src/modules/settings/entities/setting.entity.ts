import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Configurações da loja em chave/valor (ex.: `deliveryFee`). */
@Entity()
export class Setting {
  @PrimaryColumn()
  key: string;

  @Column({ type: 'decimal' })
  value: number;
}

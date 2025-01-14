import { IceCreamSize } from "src/modules/ice-cream-size/entities/ice-cream-size.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AcaiAdditionalOnSale } from "./acai_additional-on-sale.entity";

@Entity()
export class OnSaleAcai {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sizeId: string;

  @Column()
  price: number;

  @Column()
  quantity: number;

  @ManyToOne(() => IceCreamSize, { eager: true })
  @JoinColumn()
  size: IceCreamSize;

  @OneToMany(() => AcaiAdditionalOnSale, acaiAdditional => acaiAdditional.acai, { cascade: true, eager: true })
  additionals: AcaiAdditionalOnSale[];
}

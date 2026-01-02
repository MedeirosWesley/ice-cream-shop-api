import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OnSaleAcai } from "./on-sale-acai.entity";
import { Additional } from "src/modules/additional/entities/additional.entity";

@Entity()
export class AcaiAdditionalOnSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OnSaleAcai, acai => acai.additionals, { onDelete: 'CASCADE' })
  @JoinColumn()
  acai: OnSaleAcai;

  @ManyToOne(() => Additional, { eager: true,  onDelete: 'CASCADE', })

  @JoinColumn()
  additional: Additional;
}

import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OnSaleAcaiOrder } from "./on-sale-acai-order.entity";
import { Additional } from "src/modules/additional/entities/additional.entity";

@Entity()
export class OnSaleAcaiAdditional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column()
  isSeparated: boolean;

  @Column({ default: false })
  isRemoved: boolean;

  @ManyToOne(() => OnSaleAcaiOrder, acai => acai.additionalExtra, { onDelete: 'CASCADE' })
  @JoinColumn()
  acai: OnSaleAcaiOrder;


  @ManyToOne(() => OnSaleAcaiOrder, acai => acai.additionalRemoved, { onDelete: 'CASCADE' })
  @JoinColumn()
  acaiRemoved: OnSaleAcaiOrder;

  @ManyToOne(() => Additional, { eager: true })
  @JoinColumn()
  additional: Additional;
}
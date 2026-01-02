import { OnSaleAcai } from "src/modules/on-sale-acai/entities/on-sale-acai.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { OnSaleAcaiAdditional } from "./on-sale-acai-additional.entity";

@Entity()
export class OnSaleAcaiOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  onSaleAcaiId: string;

  @ManyToOne(() => OnSaleAcai, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  onSaleAcai: OnSaleAcai;

  @OneToMany(() => OnSaleAcaiAdditional, acaiAdditional => acaiAdditional.acai, { cascade: true, eager: true })
  additionalExtra: OnSaleAcaiAdditional[];

  @OneToMany(() => OnSaleAcaiAdditional, acaiAdditional => acaiAdditional.acaiRemoved, { cascade: true, eager: true })
  additionalRemoved: OnSaleAcaiAdditional[];
}